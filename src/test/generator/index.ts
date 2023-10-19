import fs from 'fs/promises';
import { parseWorkers } from '../../auto-schedule/io';
import { ExtraDutyTableV2, Holidays, WorkerRegistriesMap } from '../../extra-duty-lib';
import { Benchmarker, Result, analyseResult } from '../../utils';
import { argvCompiler } from '../../utils/cli';
import { WorkerMocker } from './mock/worker';
import { MainTableFactory } from '../../auto-schedule/table-factories';
import path from 'path';

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
  outputFile?: string;
}

async function exec(options: TestExecOptions = {}) {
  const {
    mode = options.inputFile !== undefined ? 'input-file' : 'mock',
    inputFile = 'input/data.xlsx',
    outputFile,
  } = options;

  const beckmarker = new Benchmarker();
  const year = 2023;
  const month = 9;

  const workers = mode === 'mock'
    ? mockWorkers(year, month)
    : await loadWorkers(year, month, inputFile);

  const table = new ExtraDutyTableV2({ month, year });

  const tableAssignBenchmark = beckmarker.start('talbe assign');

  table.tryAssignArrayMultipleTimes(workers, 7000);

  tableAssignBenchmark.end();

  const analisysString = analyseResult(table);
  console.log(analisysString);

  const benchmarkString = beckmarker.getMessage();
  console.log(benchmarkString);

  console.log(table.integrity);
  console.log(`pode ser utilizado: ${table.integrity.isCompliant()}`);

  if (outputFile) {
    const pattern = await fs.readFile('input/output-pattern.xlsx');

    const factory = new MainTableFactory(pattern);

    const outBuffer = await factory.generate(table, { sheetName: 'DADOS' });

    const outputFileWithExt = path.extname(outputFile) === 'xlsx'
      ? outputFile
      : outputFile + '.xlsx';

    fs.writeFile(path.resolve(outputFileWithExt), outBuffer);
  }
}

async function runCli() {
  const cliController = argvCompiler.compile();

  if (cliController.hasFlag('help', 'h')) {
    console.log(
      'flags:\n' +
      '  --mode <"mock" | "input-file"> : select the execution mode (aliases to -m)\n' +
      '  --input <string> : the input file path (aliases to -i)\n' +
      '  --output <string> : the output file path (aliases to -o)'
    );

    return;
  }

  exec({
    mode: cliController.optionalFlag('mode', 'm')?.asEnum(['mock', 'input-file']),
    inputFile: cliController.optionalFlag('input', 'i')?.asString(),
    outputFile: cliController.optionalFlag('output', 'o')?.asString(),
  });
}

runCli();