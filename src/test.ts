import fs from 'fs/promises';
import { execute } from './auto-schedule';
import { Benchmarker } from './utils/benchmark';
import { ResultError } from './utils/result';
import { BookHandler } from './xlsx-handlers/book';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';

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

  const cell = sheet.at('b', 14);

  console.log(cell.cell.s);

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

programTest();

// XLSXHandersTest();