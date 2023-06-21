import fs from 'fs/promises';
import { Benchmarker } from './utils/benchmark';
import { ResultError } from './utils/result';
import { BookHandler } from './xlsx-handlers/book';
import { io, generate, execute } from '.';

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
  const registriesFileBuffer = await fs.readFile('input/Efetivo Mat. e CPF.xlsx');
  readInputFilesProcess.end();

  const parseRegistriesProcess = benchmarker.start('parse registries');
  const workerRegistryMap = io.parseRegistryMap(registriesFileBuffer);
  parseRegistriesProcess.end();

  const outdata = await generate(inputBuffer, {
    patternData: patternBuffer,
    outputSheetName: 'DADOS',
    onAnalyse: console.log,
    workerRegistryMap,
    benchmarker,
  });

  const writeOutputFileProcess = benchmarker.start('write output file'); 
  await fs.writeFile('./output/data.xlsx', outdata);
  writeOutputFileProcess.end();

  fullProcess.end();

  const benchmarkMessage = benchmarker.getMessage();
  console.log(benchmarkMessage);
}

generateTest();

// programTest();

// XLSXHandersTest();