import fs from 'fs/promises';
import { parseWorkers } from '../../auto-schedule/io';
import { ExtraDutyTableV2, Holidays, WorkerRegistriesMap } from '../../extra-duty-lib';
import { Benchmarker, Result, analyseResult } from '../../utils';
import { argvCompiler } from '../../utils/cli';
import { WorkerMocker } from './mock/worker';

function mockWorkers(year: number, month: number) {
  const workerMocker = new WorkerMocker();

  return workerMocker.createArray(28, { mode: 'random', config: { month, year } });
}

async function loadWorkers(year: number, month: number, inputFile: string) {
  const inputBuffer = await fs.readFile(inputFile);
  const registriesFileBuffer = await fs.readFile('input/registries.json');
  const holidaysFileBuffer = await fs.readFile('./input/feriados.json');

  const workerRegistryMap = Result.unwrap(WorkerRegistriesMap.parseJSON(registriesFileBuffer));

  const holidays = Result.unwrap(Holidays.safeParse(holidaysFileBuffer));

  return parseWorkers(inputBuffer, {
    workerRegistryMap,
    holidays,
    month,
    year,
  });
}

export type WorkersLoadMode = 'mock' | 'input-file';

export interface TestExecOptions {
  mode?: WorkersLoadMode;
  inputFile?: string;
}

async function exec(options: TestExecOptions = {}) {  
  const {
    mode = options.inputFile !== undefined ? 'input-file' : 'mock',
    inputFile = 'input/data.xlsx',
  } = options;
  
  const beckmarker = new Benchmarker();
  const year = 2023;
  const month = 10;

  const workers = mode === 'mock'
    ? mockWorkers(year, month)
    : await loadWorkers(year, month, inputFile);

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
}

const cliController = argvCompiler.compile();

exec({
  mode: cliController.optionalFlag('mode', 'M')?.asEnum(['mock', 'input-file']),
  inputFile: cliController.optionalFlag('input', 'I')?.asString(),
});