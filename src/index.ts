import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import { TableWorker } from './table-worker';
import { ExtraDutyTable, ExtraDutyTableEntry } from './extra-duty-table';
import { WorkerInfo } from './extra-duty-table/worker-info';

function workerNumOfDaysOffSorter(a: WorkerInfo, b: WorkerInfo): number {
  return a.daysOfWork.getNumOfDaysOff() - b.daysOfWork.getNumOfDaysOff();
}

function forkArray<T>(array: Array<T>, separator: (value: T) => boolean) {
  let falseArray = [];
  let trueArray = [];

  for (let item of array) {
    if (separator(item)) {
      trueArray.push(item);
    } else {
      falseArray.push(item);
    }
  }

  return { falseArray, trueArray }
}

function toInterval(start: number, end: number) {
  return `${start.toString().padStart(2, '0')} ÀS ${end.toString().padStart(2, '0')}h`;
}

function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
  return a.workerName < b.workerName ? -1 : a.workerName > b.workerName ? 1 : 0;
}

const DEBUG = true;

function extraDutyTableEntryToRow({
  day,
  dutyEnd,
  dutyStart,
  workerName
}: ExtraDutyTableEntry) {
  return [day.toString(), toInterval(dutyStart, dutyEnd), workerName];
}

async function main() {
  const data = await fs.readFile('input/JUNHO COMANDO.2023.xlsx');
  const book = XLSX.read(data);

  const tableWorker = new TableWorker(book);

  tableWorker.useSheet('Planilha1');

  const start = 2;
  const end = 32;

  const NAME_COL = 'd';
  const TIME_TABLE_COL = 'f';

  const workerInfos: WorkerInfo[] = [];

  const startT = Date.now();

  for (let i = start; i < end; i++) {
    const name = tableWorker.get(NAME_COL, i);
    const timeTable = tableWorker.get(TIME_TABLE_COL, i);

    if (!name || !timeTable) continue;

    const worker = WorkerInfo.parse(name, timeTable);
    if (!worker) continue;

    workerInfos.push(worker);
  }

  const extraTable = new ExtraDutyTable();
  const sortedWorkers = workerInfos
  // .sort(workerNumOfDaysOffSorter)

  const { falseArray, trueArray } = forkArray(sortedWorkers, v => v.daysOfWork.getNumOfDaysOff() < 10);

  extraTable.assignArray(trueArray);
  extraTable.assignArray(falseArray);

  const dpEndT = Date.now();

  const outBook = XLSX.utils.book_new();
  const extraEntries = extraTable.toArray();

  console.log(`Faltaram ${workerInfos.length * 10 - extraEntries.length} cargos!`);

  const sheetBody = extraEntries
    .sort(workerNameSorter)
    .map(extraDutyTableEntryToRow);

  XLSX.utils.book_append_sheet(outBook, XLSX.utils.aoa_to_sheet([
    ['Dia', 'Plantão', 'Nome']
  ].concat(sheetBody)), 'Main');

  await fs.writeFile('output/out-data.xlsx', XLSX.write(outBook, { type: 'buffer' }));

  const endT = Date.now();

  if (DEBUG) {
    console.log(`Ended in ${endT - startT}ms`);
    console.log(`Ended data process in ${dpEndT - startT}ms`)
  }
}

main();
