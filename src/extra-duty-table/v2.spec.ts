import { ExtraDutyTableV2 } from "./v2";
import { WorkerInfo } from "./worker-info";

const table = new ExtraDutyTableV2({ month: 5 });

const day = table.getDay(0);

const results: boolean[] = [
  day.insert(WorkerInfo.fromName('José'), 0),
  day.insert(WorkerInfo.fromName('Maria'), 0),
  day.insert(WorkerInfo.fromName('Ruan'), 1),
  day.insert(WorkerInfo.fromName('Jose'), 1),
  day.insert(WorkerInfo.fromName('Marina'), 2),
  day.insert(WorkerInfo.fromName('Roberto'), 2),
  day.insert(WorkerInfo.fromName('Jeremias'), 3),
  day.insert(WorkerInfo.fromName('Lucas'), 3),
];

console.log(`resultados = ${results}`);
console.log(day.getDuty(0))