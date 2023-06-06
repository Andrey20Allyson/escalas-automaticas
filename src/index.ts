import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import { TableWorker } from './table-worker';
import { ExtraDutyTable, ExtraDutyTableEntry } from './extra-duty-table';
import { WorkerInfo } from './extra-duty-table/worker-info';

function workerNumOfDaysOffSorter(a: WorkerInfo, b: WorkerInfo): number {
  return a.daysOfWork.getNumOfDaysOff() - b.daysOfWork.getNumOfDaysOff();
}

function sum(a: number, b: number) {
  return a + b;
}

function analyseDuties(duties: ExtraDutyTableEntry[], extraTable: ExtraDutyTable) {
  const numOfWorkersMap = new Array(extraTable.width).fill(null).map(v => [0, 0, 0, 0] as [number, number, number, number]);

  for (let i = 0; i < duties.length; i++) {
    const duty = duties[i];

    switch (duty.dutyStart) {
      case 1:
        numOfWorkersMap[duty.day][0]++;
        break;
      case 7:
        numOfWorkersMap[duty.day][1]++;
        break;
      case 13:
        numOfWorkersMap[duty.day][2]++;
        break;
      case 19:
        numOfWorkersMap[duty.day][3]++;
        break;
      default: 
        throw new Error(`unknow duty a at hour ${duty.dutyStart}`)
    }
  }

  for (let i = 0; i < numOfWorkersMap.length; i++) {
    const numOfWorkers = numOfWorkersMap[i];
    if (numOfWorkers.reduce(sum, 0) <= 0) continue;

    console.log(`dia ${i + 1} tem os cargos do 1 ao 4 ocupados com ${numOfWorkers.join(', ')} respectivamente`);
  }
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
  return [(day + 1).toString(), toInterval(dutyStart, dutyEnd), workerName];
}

async function saveTable(entries: ExtraDutyTableEntry[]) {
  const outBook = XLSX.utils.book_new();
  const sheetBody = entries
    // .sort(workerNameSorter)
    .map(extraDutyTableEntryToRow);

  XLSX.utils.book_append_sheet(outBook, XLSX.utils.aoa_to_sheet([
    ['Dia', 'Plantão', 'Nome']
  ].concat(sheetBody)), 'Main');

  await fs.writeFile('output/out-data.xlsx', XLSX.write(outBook, { type: 'buffer' }));
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
  // extraTable.assignArray(falseArray);

  const dpEndT = Date.now();

  const extraEntries = extraTable.toArray();

  console.log(`Faltaram ${workerInfos.length * 10 - extraEntries.length} cargos!`);

  analyseDuties(extraEntries, extraTable);

  // await saveTable(extraEntries);

  const endT = Date.now();

  if (DEBUG) {
    console.log(`Ended in ${endT - startT}ms`);
    console.log(`Ended data process in ${dpEndT - startT}ms`)
  }
}

main();
