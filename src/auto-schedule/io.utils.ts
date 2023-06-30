import { Holidays, WorkerRegistriesMap, WorkerInfo } from "../extra-duty-lib";
import { Result, ResultType, ResultError } from "../utils";
import { LineHander, CellHandler, BookHandler } from "../xlsx-handlers";
import * as XLSX from 'xlsx';

export enum WorkerInfoCollumns {
  NAME = 'd',
  HOURLY = 'f',
  PATENT = 'b',
  POST = 'e',
  REGISTRATION = 'c',
}

export const collumnsTuple = LineHander.collumnTuple([
  WorkerInfoCollumns.NAME,
  WorkerInfoCollumns.HOURLY,
  WorkerInfoCollumns.PATENT,
  WorkerInfoCollumns.POST,
  WorkerInfoCollumns.REGISTRATION
]);

export const cellsTypeTuple = CellHandler.typeTuple([
  'string',
  'string',
  'string?',
  'string?',
  'string'
]);

export function scrappeWorkersFromBook(book: XLSX.WorkBook, options: ScrappeWorkersOptions) {
  return Result.unwrap(safeScrappeWorkersFromBook(book, options));
}

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