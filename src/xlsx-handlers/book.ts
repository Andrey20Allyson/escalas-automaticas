import XLSX from 'xlsx';
import { Result, error, unwrap } from '../utils/result';
import { SheetHandler } from './sheet';

export class BookHandler {
  private sheetMap: Map<string, SheetHandler>;

  constructor(
    readonly book: XLSX.WorkBook
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

  sheet(name: string) {
    return unwrap(this.safeSheet(name));
  }

  safeSheet(name: string): Result<SheetHandler> {
    const sheet: XLSX.WorkSheet | undefined = this.book.Sheets[name];

    const mappedHandler = this.sheetMap.get(name);
    if (mappedHandler) return mappedHandler;

    if (!sheet) return error(`Can't find sheet with name '${name}'`);

    const handler = new SheetHandler(sheet);

    this.sheetMap.set(name, handler);

    return handler;
  }

  static parse(data: any) {
    const book = XLSX.read(data, {
      cellStyles: true,
    });

    return new this(book);
  }
}