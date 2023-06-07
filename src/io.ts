import { ExtraDutyTableEntry, ExtraDutyTable } from "./extra-duty-table";
import fs from 'fs/promises';
import * as XLSX from 'xlsx';
import { WorkerInfo } from "./extra-duty-table/worker-info";
import { TableWorker } from "./table-worker";

export function toInterval(start: number, end: number) {
  return `${start.toString().padStart(2, '0')} ÀS ${end.toString().padStart(2, '0')}h`;
}

export function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
  return a.workerName < b.workerName ? -1 : a.workerName > b.workerName ? 1 : 0;
}

export function extraDutyTableEntryToRow({
  day,
  dutyEnd,
  dutyStart,
  workerName,
}: ExtraDutyTableEntry) {
  return [(day + 1).toString(), toInterval(dutyStart, dutyEnd), workerName];
}

export async function saveTable(file: string, table: ExtraDutyTable, sortByName = false) {
  const outBook = XLSX.utils.book_new();
  const entries = Array.from(table.entries())

  if (sortByName) entries.sort(workerNameSorter);
  
  const sheetBody = entries.map(extraDutyTableEntryToRow);

  XLSX.utils.book_append_sheet(outBook, XLSX.utils.aoa_to_sheet([['Dia', 'Plantão', 'Nome']].concat(sheetBody)), 'Main');

  await fs.writeFile(file.endsWith('.xlsx') ? file : file + '.xlsx', XLSX.write(outBook, { type: 'buffer' }));
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

  sheetName = tableWorker.book.SheetNames.length === 1? tableWorker.book.SheetNames[0] : sheetName;
  if (!sheetName) throw new MustInsertSheetNameError();

  const sheetExists = tableWorker.useSheet(sheetName);
  if (!sheetExists) throw new SheetNotFoundError(sheetName, tableWorker.book.SheetNames);

  const start = 2;
  const end = 32;

  const NAME_COL = 'd';
  const TIME_TABLE_COL = 'f';

  const workerInfos: WorkerInfo[] = [];

  for (let i = start; i < end; i++) {
    const name = tableWorker.get(NAME_COL, i);
    const timeTable = tableWorker.get(TIME_TABLE_COL, i);

    if (!name || !timeTable) continue;

    const worker = WorkerInfo.parse(name, timeTable);
    if (!worker) continue;

    workerInfos.push(worker);
  }

  return workerInfos;
}

export async function loadBook(path: string) {
  const data = await fs.readFile(path);
  
  return XLSX.read(data);
}

export async function loadWorkers(path: string, sheetName?: string) {
  const book = await loadBook(path);
  
  return scrappeWorkersFromBook(book, sheetName);
}