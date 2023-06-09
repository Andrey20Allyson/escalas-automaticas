import fs from 'fs/promises';
import { execute, generate, io } from '.';
import { ExtraDutyTableV2, Holidays, WorkerRegistriesMap } from './extra-duty-lib';
import { Benchmarker, Result, ResultError, analyseResult, getMonth, getYear, iterRange, randomIntFromInterval } from './utils';
import { BookHandler } from './xlsx-handlers/book';
import { parseTable, parseWorkers } from './auto-schedule/io';
import { MainTableFactory } from './auto-schedule/table-factories';

io.setFileSystem(fs);

async function programTest() {
  const INPUT_FILE = './input/data.xlsx';
  const OUTPUT_FILE = './output/out-data.xlsx';
  
  await execute({
    input: INPUT_FILE,
    output: OUTPUT_FILE,
    analyse: true,
    benchmark: true,
  });
}

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
  const registriesFileBuffer = await fs.readFile('input/registries.json');
  const holidaysFileBuffer = await fs.readFile('./input/feriados.json');
  readInputFilesProcess.end();

  const parseRegistriesProcess = benchmarker.start('parse registries');
  const workerRegistryMap = Result.unwrap(WorkerRegistriesMap.parseJSON(registriesFileBuffer));
  parseRegistriesProcess.end();

  const holidays = Result.unwrap(Holidays.safeParse(holidaysFileBuffer));

  const outdata = await generate(inputBuffer, {
    outputSheetName: 'DADOS',
    onAnalyse: console.log,
    workerRegistryMap,
    patternBuffer,
    benchmarker,
    holidays,
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

  const patternBuffer = await fs.readFile('input/output-pattern.xlsx');

  const factory = new MainTableFactory(patternBuffer);
  factory.createCache();
  
  const tableBuffer = await fs.readFile('./output/data.xlsx');
  const workersBuffer = await fs.readFile('./input/data.xlsx');
  const registriesFileBuffer = await fs.readFile('input/registries.json');

  const workerRegistryMap = Result.unwrap(WorkerRegistriesMap.parseJSON(registriesFileBuffer));

  const workers = parseWorkers(workersBuffer, {
    workerRegistryMap,
    month,
    year,
  });
  
  const table = parseTable(tableBuffer, workers, {
    sheetName: 'DADOS',
  });

  const analysisResult = analyseResult(table, workers);
  console.log(analysisResult);

  const outputBuffer = await factory.generate(table, { sheetName: 'DADOS' });

  await fs.writeFile('./output/parsed-table.xlsx', outputBuffer);
}

generateTest();

// programTest();

// XLSXHandersTest();

// parseTableTest();