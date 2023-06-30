import type { readFile, writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import { ExtraDutyTable, WorkerInfo } from '../extra-duty-lib';
import { Result } from "../utils/result";
import { ScrappeWorkersOptions, scrappeWorkersFromBook } from './io.utils';
import { DefaultTableFactory, MainTableFactory, TableFactory, TableFactoryOptions } from './table-factories';

export interface IOFileSystem {
  readFile: typeof readFile;
  writeFile: typeof writeFile;
}

let _fs: IOFileSystem | undefined;

export function getFileSystem() {
  if (!_fs) throw new Error(`File system has not implemented, please set a file system with 'setFileSystem' function`);
  return _fs;
} 

export function setFileSystem(fs: IOFileSystem) {
  _fs = fs;
}

/**
 * @deprecated
 */
export async function saveTable(file: string, table: ExtraDutyTable, sortByName = false) {
  const fs = getFileSystem();

  const patternBuffer = await fs.readFile('./input/output-pattern.xlsx');

  const outputBuffer = await serializeTable(table, { sheetName: 'DADOS', sortByName, pattern: new MainTableFactory(patternBuffer) });

  await fs.writeFile(file.endsWith('.xlsx') ? file : file + '.xlsx', outputBuffer);
}

export async function loadBook(path: string, options?: XLSX.ParsingOptions) {
  const fs = getFileSystem();

  const data = await fs.readFile(path);

  return XLSX.read(data, options);
}

export async function loadSheetNames(path: string): Promise<string[]> {
  const fs = getFileSystem();

  const buffer = await fs.readFile(path);

  return parseSheetNames(buffer);
}

export function parseSheetNames(buffer: Buffer): string[] {
  const book = XLSX.read(buffer, { bookSheets: true });

  return book.SheetNames;
}

export async function loadWorkers(path: string, options: ScrappeWorkersOptions) {
  const book = await loadBook(path);

  return scrappeWorkersFromBook(book, options);
}

export function parseWorkers(data: Buffer, options: ScrappeWorkersOptions): WorkerInfo[] {
  const book = XLSX.read(data);

  return scrappeWorkersFromBook(book, options);
}

export interface SerializeTableOptions extends TableFactoryOptions {
  pattern?: TableFactory;
}

export async function serializeTable(table: ExtraDutyTable, options: SerializeTableOptions): Promise<Buffer> {
  const factory = options.pattern ?? new DefaultTableFactory();

  return Result.unwrap(await factory.generate(table, options));
}
