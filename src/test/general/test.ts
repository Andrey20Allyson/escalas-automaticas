import fs from 'fs/promises';
import { generateFromWorkers, io } from '../..';
import { parseTable, parseWorkers } from '../../auto-schedule/io';
import { FirebaseWorkerRegistryLoader } from '../../auto-schedule/registries/worker-registry/loader';
import { DayListTableFactory } from '../../auto-schedule/table-factories/day-list-factory';
import { Holidays } from '../../extra-duty-lib';
import { Benchmarker, Result, ResultError, analyseResult, getMonth, getYear } from '../../utils';
import { BookHandler } from '../../xlsx-handlers/book';

io.setFileSystem(fs);

async function XLSXHandersTest() {
  const inputBuffer = await fs.readFile('input/output-pattern.xlsx');

  const book = BookHandler.parse(inputBuffer);
  const sheet = book.getSheet('DADOS');

  const benchmarker = new Benchmarker();

  const iteration = benchmarker.start('Table iteration');

  for (const line of sheet.iterLines(15, 150)) {
    const name = line.at('b').safeAs('string?');

    if (ResultError.isError(name)) continue;

    name.value = `pessoa ${line.line - 14}`;
  }

  iteration.end();

  const benchmarkMessage = benchmarker.getMessage();
  console.log(benchmarkMessage);
}

async function generateTest() {
  const benchmarker = new Benchmarker();

  const fullProcess = benchmarker.start('full process');

  const readInputFilesProcess = benchmarker.start('read input files');
  const inputBuffer = await fs.readFile('input/data.xlsx');
  const patternBuffer = await fs.readFile('input/output-pattern.xlsx');
  const holidaysFileBuffer = await fs.readFile('./input/feriados.json');
  readInputFilesProcess.end();

  const loader = new FirebaseWorkerRegistryLoader();
  const workerRegistries = await loader.load();

  const holidays = Result.unwrap(Holidays.safeParse(holidaysFileBuffer));

  const month = getMonth();
  const year = getYear();

  const workersParseProcess = benchmarker.start('parse workers');
  const workers = parseWorkers(inputBuffer, {
    workerRegistries,
    holidays,
    month,
    year,
  });
  workersParseProcess.end();

  const outdata = await generateFromWorkers(workers, {
    outputSheetName: 'DADOS',
    onAnalyse: console.log,
    patternBuffer,
    benchmarker,
  });

  const writeOutputFileProcess = benchmarker.start('write output file');
  await fs.writeFile('./output/data.xlsx', outdata);
  writeOutputFileProcess.end();

  fullProcess.end();

  const benchmarkMessage = benchmarker.getMessage();
  console.log(benchmarkMessage);
}

async function parseTableTest() {
  const month = getMonth();
  const year = getYear();

  const factory = new DayListTableFactory();

  const tableBuffer = await fs.readFile('./output/data.xlsx');
  const workersBuffer = await fs.readFile('./input/data.xlsx');

  const loader = new FirebaseWorkerRegistryLoader();
  const workerRegistries = await loader.load();

  const workers = parseWorkers(workersBuffer, {
    workerRegistries,
    month,
    year,
  });

  const table = parseTable(tableBuffer, workers, {
    sheetName: 'DADOS',
  });

  const analysisResult = analyseResult(table);
  console.log(analysisResult);

  const outputBuffer = await factory.generate(table, { sheetName: 'Divulgação' });

  await fs.writeFile('./output/parsed-table.xlsx', outputBuffer);
}

const command = process.argv.slice(2).find(str => !str.startsWith('--'));

switch (command) {
  case 'parser':
    parseTableTest();
    break;
  case 'generator':
    generateTest();
    break;
  default:
    throw new Error(`Unknow command named '${command}'`);
}