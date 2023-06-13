import { ExtraDutyTableEntry, ExtraDutyTable } from "../extra-duty-table";
import fs from 'fs/promises';
import * as XLSX from 'xlsx';
import { WorkerInfo } from "../extra-duty-table/worker-info";
import { TableWorker } from "./table-worker";

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

export async function saveTable(file: string, table: ExtraDutyTable, sortByName = false) {
  await fs.writeFile(file.endsWith('.xlsx') ? file : file + '.xlsx', serializeTable(table, { sheetName: 'Main', sortByName }));
}

export class EmptyBookError extends Error {
  constructor() {
    super(`This book is empty!`);
  }
}

export class MustInsertSheetNameError extends Error {
  constructor() {
    super(`If book have more than one sheet you must insert a sheet name!`);
  }
}

export class SheetNotFoundError extends Error {
  constructor(sheetName: string, sheetList: string[]) {
    super(`Can't find sheet with name "${sheetName}"!\n  Did you mean ${sheetList.map((name) => `\n    "${name}"`).join(';')}\n`);
  }
}

export function scrappeWorkersFromBook(book: XLSX.WorkBook, sheetName?: string) {
  const tableWorker = new TableWorker(book);
  if (tableWorker.book.SheetNames.length === 0) throw new EmptyBookError();

  sheetName = tableWorker.book.SheetNames.length === 1 ? tableWorker.book.SheetNames[0] : sheetName;
  if (!sheetName) throw new MustInsertSheetNameError();

  const sheetExists = tableWorker.useSheet(sheetName);
  if (!sheetExists) throw new SheetNotFoundError(sheetName, tableWorker.book.SheetNames);
  
  enum Collumn {
    NAME = 'd',
    HOURLY = 'f',
    PATENT = 'b',
    POST = 'e',
    REGISTRATION = 'c',
  }

  const workerInfos: WorkerInfo[] = [];

  let i = 2;
  while (true) {
    const j = i++;

    const hourly = tableWorker.get(Collumn.HOURLY, j);
    const registration = tableWorker.get(Collumn.REGISTRATION, j);
    
    const name = tableWorker.get(Collumn.NAME, j) ?? '';
    const patent = tableWorker.get(Collumn.PATENT, j) ?? '';
    const post = tableWorker.get(Collumn.POST, j) ?? '';

    if (!registration || !hourly) break;

    const worker = WorkerInfo.parse({
      name,
      post,
      hourly,
      patent,
      registration,
    });

    if (!worker) continue;

    workerInfos.push(worker);
  }

  return workerInfos;
}

export async function loadBook(path: string, options?: XLSX.ParsingOptions) {
  const data = await fs.readFile(path);

  return XLSX.read(data, options);
}

export async function loadSheetNames(path: string) {
  const book = await loadBook(path, { bookSheets: true });

  return book.SheetNames;
}

export async function loadWorkers(path: string, sheetName?: string) {
  const book = await loadBook(path);

  return scrappeWorkersFromBook(book, sheetName);
}

export function parseWorkers(data: Buffer, sheetName?: string): WorkerInfo[] {
  const book = XLSX.read(data);

  return scrappeWorkersFromBook(book, sheetName);
}

export interface SerializeTableOptions {
  sheetName: string;
  sortByName?: boolean;
}

export function serializeTable(table: ExtraDutyTable, options: SerializeTableOptions): Buffer {
  const outBook = XLSX.utils.book_new();
  const entries = Array.from(table.entries());

  if (options.sortByName) entries.sort(utils.workerNameSorter);

  const sheetBody = utils.toSheetBody(entries);

  XLSX.utils.book_append_sheet(outBook, XLSX.utils.aoa_to_sheet(sheetBody), options.sheetName);

  return XLSX.write(outBook, { type: 'buffer' });
}
