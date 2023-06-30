import type { readFile, writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import { ExtraDutyTable, ExtraDutyTableEntry, Holidays, WorkerInfo, WorkerRegistriesMap } from '../extra-duty-lib';
import { Result, ResultError, ResultType } from "../utils/result";
import { BookHandler, CellHandler, LineHander } from "../xlsx-handlers";
import { MainTableFactory } from './table-factories';

export interface IOFileSystem {
  readFile: typeof readFile;
  writeFile: typeof writeFile;
}

let _fs: IOFileSystem | undefined;

export function getFileSystem() {
  if (!_fs) throw new Error(`File system not implemented, please set a file system with 'setFileSystem' function`);
  return _fs;
} 

export function setFileSystem(fs: IOFileSystem) {
  _fs = fs;
}

export namespace utils {
  export function toInterval(start: number, end: number) {
    return `${start.toString().padStart(2, '0')} ÀS ${end.toString().padStart(2, '0')}h`;
  }

  export function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
    return a.worker < b.worker ? -1 : a.worker > b.worker ? 1 : 0;
  }

  export function toStringTuple(entry: ExtraDutyTableEntry, index: number): string[] {
    return [
      (entry.day.day + 1).toString(),
      toInterval((entry.duty.start + 6 * index) % 24, (entry.duty.start + 6 * (index + 1)) % 24),
      entry.worker.name,
      `${entry.worker.config.registration}-${entry.worker.config.postResistration}`,
      entry.worker.config.patent,
      entry.worker.config.post,
    ];
  }

  export function toSheetBody(entries: ExtraDutyTableEntry[]): string[][] {
    const body: string[][] = [['Dia', 'Plantão', 'Nome', 'Mat', 'Grad', 'Posto']];

    for (const entry of entries) {
      body.push(toStringTuple(entry, 0));
      body.push(toStringTuple(entry, 1));
    }

    return body;
  }
}

/**
 * @deprecated
 */
export async function saveTable(file: string, table: ExtraDutyTable, sortByName = false) {
  const fs = getFileSystem();

  const patternBuffer = await fs.readFile('./input/output-pattern.xlsx');

  const outputBuffer = await serializeTable(table, { sheetName: 'DADOS', sortByName, pattern: new MainTableFactory(patternBuffer) });

  await fs.writeFile(file.endsWith('.xlsx') ? file : file + '.xlsx', outputBuffer);
}

export function scrappeWorkersFromBook(book: XLSX.WorkBook, options: ScrappeWorkersOptions) {
  return Result.unwrap(safeScrappeWorkersFromBook(book, options));
}

export enum WorkerInfoCollumns {
  NAME = 'd',
  HOURLY = 'f',
  PATENT = 'b',
  POST = 'e',
  REGISTRATION = 'c',
}

const collumnsTuple = LineHander.collumnTuple([
  WorkerInfoCollumns.NAME,
  WorkerInfoCollumns.HOURLY,
  WorkerInfoCollumns.PATENT,
  WorkerInfoCollumns.POST,
  WorkerInfoCollumns.REGISTRATION
]);

const cellsTypeTuple = CellHandler.typeTuple([
  'string',
  'string',
  'string?',
  'string?',
  'string'
]);

export interface ScrappeWorkersOptions {
  month: number;
  sheetName?: string;
  holidays?: Holidays;
  workerRegistryMap?: WorkerRegistriesMap;
}

export function safeScrappeWorkersFromBook(workBook: XLSX.WorkBook, options: ScrappeWorkersOptions): ResultType<WorkerInfo[]> {
  const book = new BookHandler(workBook);

  const sheet = book.safeGetSheet(options.sheetName);
  if (ResultError.isError(sheet)) return sheet;

  const workerInfos: WorkerInfo[] = [];

  for (const line of sheet.iterLines(2)) {
    const cellsResult = line.safeGetCells(collumnsTuple);
    if (ResultError.isError(cellsResult)) return cellsResult;

    const typedCellsResult = CellHandler.safeTypeAll(cellsResult, cellsTypeTuple);
    if (ResultError.isError(typedCellsResult)) return typedCellsResult;

    const [nameCell, hourlyCell, patentCell, postCell, registrationCell] = typedCellsResult;

    const individualRegistry = options.workerRegistryMap?.get(registrationCell.value);
    if (ResultError.isError(individualRegistry)) return individualRegistry;

    try {
      const worker = WorkerInfo.parse({
        name: nameCell.value,
        hourly: hourlyCell.value,
        registration: registrationCell.value,
        individualRegistry: individualRegistry?.individualID ?? '0',
        patent: patentCell.value ?? '',
        post: postCell.value ?? '',
        month: options.month,
      });

      if (!worker) continue;

      if (options.month && options.holidays && worker.daysOfWork.isDailyWorker) {
        worker.daysOfWork.addHolidays(options.holidays, options.month);
      }

      workerInfos.push(worker);
    } catch (e) {
      return ResultError.create(e);
    }
  }

  return workerInfos;
}

export async function loadBook(path: string, options?: XLSX.ParsingOptions) {
  const fs = getFileSystem();

  const data = await fs.readFile(path);

  return XLSX.read(data, options);
}

export async function loadSheetNames(path: string): Promise<string[]> {
  const fs = getFileSystem();

  const buffer = await fs.readFile(path);

  return parseSheetNames(buffer);
}

export function parseSheetNames(buffer: Buffer): string[] {
  const book = XLSX.read(buffer, { bookSheets: true });

  return book.SheetNames;
}

export async function loadWorkers(path: string, options: ScrappeWorkersOptions) {
  const book = await loadBook(path);

  return scrappeWorkersFromBook(book, options);
}

export function parseWorkers(data: Buffer, options: ScrappeWorkersOptions): WorkerInfo[] {
  const book = XLSX.read(data);

  return scrappeWorkersFromBook(book, options);
}

export interface TableFactory {
  generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer>;
}

export interface TableFactoryOptions {
  sheetName: string;
  sortByName?: boolean;
}

export interface SerializeTableOptions extends TableFactoryOptions {
  pattern?: TableFactory;
}

export class DefaultTableFactory implements TableFactory {
  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer> {
    const book = XLSX.utils.book_new();
    const entries = Array.from(table.entries());

    if (options.sortByName) entries.sort(utils.workerNameSorter);

    const sheetBody = utils.toSheetBody(entries);

    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sheetBody), options.sheetName);

    return XLSX.write(book, { type: 'buffer' });
  }
}

export const defaultTableFactory = new DefaultTableFactory();

export async function serializeTable(table: ExtraDutyTable, options: SerializeTableOptions): Promise<Buffer> {
  const factory = options.pattern ?? defaultTableFactory;

  return Result.unwrap(await factory.generate(table, options));
}
