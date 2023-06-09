import * as XLSX from 'xlsx';
import { ExtraDutyTableV2, Holidays, WorkerInfo, WorkerRegistriesMap } from "../extra-duty-lib";
import { Result, ResultError, ResultType } from "../utils";
import { BookHandler, CellHandler, LineHander } from "../xlsx-handlers";
import { ExcelTime } from "../xlsx-handlers/utils";

export enum WorkerInfoCollumns {
  NAME = 'd',
  HOURLY = 'f',
  GRAD = 'b',
  POST = 'e',
  REGISTRATION = 'c',
}

export const workersTableCollumns = LineHander.collumnTuple([
  WorkerInfoCollumns.NAME,
  WorkerInfoCollumns.HOURLY,
  WorkerInfoCollumns.GRAD,
  WorkerInfoCollumns.POST,
  WorkerInfoCollumns.REGISTRATION
]);

export const workersTableCellTypes = CellHandler.typeTuple([
  'string',
  'string',
  'string',
  'string?',
  'string'
]);

export function scrappeWorkersFromBook(book: XLSX.WorkBook, options: ScrappeWorkersOptions) {
  return Result.unwrap(safeScrappeWorkersFromBook(book, options));
}

export interface ScrappeWorkersOptions {
  year: number;
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
    const cellsResult = line.safeGetCells(workersTableCollumns);
    if (ResultError.isError(cellsResult)) return cellsResult;

    const typedCellsResult = CellHandler.safeTypeAll(cellsResult, workersTableCellTypes);
    if (ResultError.isError(typedCellsResult)) return typedCellsResult;

    const [nameCell, hourlyCell, gradCell, postCell, registrationCell] = typedCellsResult;

    const workerData = options.workerRegistryMap?.get(registrationCell.value);
    if (ResultError.isError(workerData)) return workerData;

    try {
      const worker = WorkerInfo.parse({
        name: nameCell.value,
        hourly: hourlyCell.value,
        registration: registrationCell.value,
        individualRegistry: workerData?.individualID,
        gender: workerData?.gender,
        grad: gradCell.value,
        post: postCell.value ?? '',
        month: options.month,
        year: options.year,
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

export const finalTableCollumns = LineHander.collumnTuple([
  'c', // registration
  'i', // date
  'j', // start time
  'k', // end time
]);

export const finalTableCellTypes = CellHandler.typeTuple([
  'number',
  'number',
  'number',
]);

export interface ScrappeTableOptions {
  sheetName?: string;
}

export function scrappeTable(buffer: Buffer, workers: WorkerInfo[], options: ScrappeTableOptions): ExtraDutyTableV2 {
  const book = BookHandler.parse(buffer);

  const sheet = book.getSheet(options.sheetName);

  const month = sheet.at('c', 7).as('number').value - 1;
  const year = sheet.at('c', 6).as('number').value;

  const table = new ExtraDutyTableV2({
    month,
    year,
  });

  const workerMap = WorkerInfo.createMap(workers);

  for (const line of sheet.iterLines(15)) {
    const selectionResult = CellHandler.safeTypeAll(line.getCells(finalTableCollumns), finalTableCellTypes);
    if (ResultError.isError(selectionResult)) break;

    const [registrationCell, dateCell, startTimeCell] = selectionResult;

    const workerID = registrationCell.value;

    const worker = workerMap.get(workerID);
    if (!worker) throw new Error(`Can't find worker with id "${workerID}"`);

    const date = new Date(1900, 0, dateCell.value - 1);
    const startTime = ExcelTime.parse(startTimeCell.value);

    const dayOfDuty = table.getDay(date.getDate() - 1);

    const { firstDutyTime, dutyDuration } = dayOfDuty.config;
    const startHour = startTime.hours;

    const duty = dayOfDuty.getDuty(Math.floor((startHour < firstDutyTime ? startHour + 24 - firstDutyTime : startTime.hours - firstDutyTime) / dutyDuration));

    if (!duty.has(worker)) duty.add(worker, true);
  }

  return table;
}