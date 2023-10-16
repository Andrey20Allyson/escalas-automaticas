import { ExtraDutyTableV2 } from '../../extra-duty-lib';
import { DefaultTableIntegrityAnalyser, TableIntegrity } from '../../extra-duty-lib/extra-duty-table/integrity';
import { Benchmarker, analyseResult } from '../../utils';
import { WorkerMocker } from './mock/worker';

const workerMocker = new WorkerMocker();
const beckmarker = new Benchmarker();

const year = 2023;
const month = 10;

const workers = workerMocker.createArray(28, { mode: 'random', config: { month, year } });
const table = new ExtraDutyTableV2({ month, year });

const tableAssignBenchmark = beckmarker.start('talbe assign');

table.tryAssignArrayMultipleTimes(workers, 400);

tableAssignBenchmark.end();

const analisysString = analyseResult(table);
console.log(analisysString);

const benchmarkString = beckmarker.getMessage();
console.log(benchmarkString);

console.log(table.integrity);
console.log(`pode ser utilizado: ${table.integrity.isCompliant()}`);