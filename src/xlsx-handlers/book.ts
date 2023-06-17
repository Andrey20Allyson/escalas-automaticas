import XLSX from 'xlsx';
import { Result, ResultError, ResultType } from '../utils/result';
import { SheetHandler } from './sheet';

export class SheetNotFoundError extends ResultError {
  constructor(sheetName: string, sheetList: readonly string[]) {
    super(`Can't find sheet with name "${sheetName}"!\n  Did you mean ${sheetList.map((name) => `\n    "${name}"`).join(';')}\n`);
  }
}

export class EmptyBookError extends ResultError {
  constructor() {
    super(`This book is empty!`);
  }
}

export class MustInsertSheetNameError extends ResultError {
  constructor() {
    super(`If book have more than one sheet you must insert a sheet name!`);
  }
}

export class BookHandler {
  private sheetMap: Map<string, SheetHandler>;

  constructor(
    readonly book: XLSX.WorkBook = XLSX.utils.book_new(),
  ) {
    this.sheetMap = new Map();
  }

  createSheet(name: string) {
    const sheet: XLSX.WorkSheet = {};

    XLSX.utils.book_append_sheet(this.book, sheet, name);

    const handler = new SheetHandler(sheet);

    this.sheetMap.set(name, handler);

    return handler;
  }

  get sheetNames(): readonly string[] {
    return this.book.SheetNames;
  }

  getSheet(name?: string) {
    return Result.unwrap(this.safeGetSheet(name));
  }

  safeGetSheet(name?: string): ResultType<SheetHandler, EmptyBookError | MustInsertSheetNameError | SheetNotFoundError> {
    if (this.sheetNames.length === 0) return new EmptyBookError();

    name = this.sheetNames.length === 1 ? this.sheetNames[0] : name;
    if (!name) return new MustInsertSheetNameError();

    const sheet: XLSX.WorkSheet | undefined = this.book.Sheets[name];

    const mappedHandler = this.sheetMap.get(name);
    if (mappedHandler) return mappedHandler;

    if (!sheet) return new SheetNotFoundError(name, this.sheetNames);

    const handler = new SheetHandler(sheet);

    this.sheetMap.set(name, handler);

    return handler;
  }

  toArrayBuffer(): ArrayBuffer {
    return XLSX.write(this.book, { type: 'array' });
  }

  toBuffer(): Buffer {
    return XLSX.write(this.book, { type: 'buffer' });
  }

  static parse(data: ArrayBuffer | Buffer) {
    const book = XLSX.read(data, {
      cellStyles: true,
    });

    return new this(book);
  }
}