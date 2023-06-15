// import { execute } from './auto-schedule';

// const INPUT_FILE = './input/data.xlsx';
// const OUTPUT_FILE = './output/out-data.xlsx';

// execute({
//   input: INPUT_FILE,
//   output: OUTPUT_FILE,
//   analyse: true,
//   benchmark: true,
// });

import fs from 'fs/promises';
import XLSX from 'xlsx';
import { SheetHandler } from './xlsx-handlers/sheet';
import { CellValueTypes } from './xlsx-handlers/cell';
import { BookHandler } from './xlsx-handlers/book';

async function main() {
  const data = await fs.readFile('input/output-pattern.xlsx');

  const book = BookHandler.parse(data);
  const sheet = new SheetHandler(book.sheet('DADOS'));

  const startT = Date.now();

  for (const line of sheet.iterLines(15, 316126)) {
    const name = line.collumnAt('b').asOptional(CellValueTypes.STRING);

    name.value = `pessoa ${line.line - 14}`;
  }

  const endT = Date.now();

  console.log(`ended at ${endT - startT}ms`);
}

main();