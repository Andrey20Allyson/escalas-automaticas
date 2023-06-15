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

async function main() {
  const data = await fs.readFile('input/output-pattern.xlsx');

  const book = XLSX.read(data, {
    cellStyles: true,
  });

  const sheet: XLSX.WorkSheet | undefined = book.Sheets['DADOS'];
  if (!sheet) throw new Error(`Can't fint sheet DADOS`);

  const sheetHandler = new SheetHandler(sheet);

  const startT = Date.now();

  for (const lineHandler of sheetHandler.iterLines(15, 316126)) {
    const name = lineHandler.collumnAt('b').asOptional(CellValueTypes.STRING);

    name.value = `pessoa ${lineHandler.line - 14}`;
  }

  const endT = Date.now();

  console.log(`ended at ${endT - startT}ms`);
}

main();