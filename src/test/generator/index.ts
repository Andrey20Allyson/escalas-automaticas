import { ExtraDutyTableV2 } from '../../extra-duty-lib';
import { WorkerMocker } from './mock/worker';
import { Benchmarker, analyseResult } from '../../utils';

const workerMocker = new WorkerMocker();
const beckmarker = new Benchmarker();

const year = 2023;
const month = 10;

const workers = workerMocker.createArray(28, { mode: 'random', config: { month, year } });
const table = new ExtraDutyTableV2({ month, year });

const tableAssignBenchmark = beckmarker.start('talbe assign');

table.tryAssignArrayMultipleTimes(workers, 64);

tableAssignBenchmark.end();

table.calculatePontuation(table.firstMonday);

const analisysString = analyseResult(table);
console.log(analisysString);

const benchmarkString = beckmarker.getMessage();
console.log(benchmarkString);

const pontuation = table.getPontuation();
console.log(`pontuation: ${pontuation}`);