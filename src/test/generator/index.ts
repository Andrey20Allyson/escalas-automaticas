import { ExtraDutyTableV2 } from '../../extra-duty-lib';
import { WorkerMocker } from './mock/worker';
import { Benchmarker, analyseResult } from '../../utils';
import { TableIntegrity, TableIntegrityAnalyser } from '../../extra-duty-lib/extra-duty-table/integrity';

const workerMocker = new WorkerMocker();
const beckmarker = new Benchmarker();
const integrityAnalyser = TableIntegrityAnalyser.fromDefault();

const year = 2023;
const month = 10;

const workers = workerMocker.createArray(28, { mode: 'random', config: { month, year } });
const table = new ExtraDutyTableV2({ month, year });

const tableAssignBenchmark = beckmarker.start('talbe assign');

table.tryAssignArrayMultipleTimes(workers, 1);

tableAssignBenchmark.end();

table.calculatePontuation(table.firstMonday);

const tableAnalisysBenchmark = beckmarker.start('table analisys');

const integrity = integrityAnalyser.analyse(table, new TableIntegrity(40000));

tableAnalisysBenchmark.end();

const analisysString = analyseResult(table);
console.log(analisysString);

const benchmarkString = beckmarker.getMessage();
console.log(benchmarkString);

console.log(integrity);
console.log(`está integro: ${integrity.isCompliant()}`);