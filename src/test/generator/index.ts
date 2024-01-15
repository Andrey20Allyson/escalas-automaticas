import fs from 'fs/promises';
import path from 'path';
import { parseWorkers } from '../../auto-schedule/io';
import { MainTableFactory } from '../../auto-schedule/table-factories';
import { ExtraDutyTable, Holidays, WorkerRegistriesMap } from '../../extra-duty-lib';
import { DEFAULT_MONTH_PARSER, Month } from '../../extra-duty-lib/structs/month';
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
  outputFile?: string;
  tries?: number;
  month?: Month;
}

async function exec(options: TestExecOptions = {}) {
  const {
    mode = options.inputFile !== undefined ? 'input-file' : 'mock',
    inputFile = 'input/data.xlsx',
    tries = 7000,
    outputFile,
    month = Month.now(),
  } = options;

  const beckmarker = new Benchmarker();

  const workers = mode === 'mock'
    ? mockWorkers(month.year, month.index)
    : await loadWorkers(month.year, month.index, inputFile);

  const table = new ExtraDutyTable({
    year: month.year,
    month: month.index,
  });

  const tableAssignBenchmark = beckmarker.start('talbe assign');

  table.tryAssignArrayMultipleTimes(workers, tries);

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

    const outputFileWithExt = path.extname(outputFile) === '.xlsx'
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
      '  --output <string> : the output file path (aliases to -o)\n' +
      '  --tries <number> : the number of times that the program will try generate the table (aliases to -t)\n' +
      '  --date <mm/yy> : the month of extra duty table (aliases to -d)'
    );

    return;
  }

  const rawDate = cliController.optionalFlag('date', 'd')?.asString();
  const month = rawDate ? DEFAULT_MONTH_PARSER.parse(rawDate) : undefined;

  exec({
    mode: cliController.optionalFlag('mode', 'm')?.asEnum(['mock', 'input-file']),
    inputFile: cliController.optionalFlag('input', 'i')?.asString(),
    outputFile: cliController.optionalFlag('output', 'o')?.asString(),
    tries: cliController.optionalFlag('tries', 't')?.asNumber(),
    month,
  });
}

runCli();