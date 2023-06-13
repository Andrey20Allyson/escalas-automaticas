import * as XLSX from 'xlsx';

export class TableWorker {
  private _sheet?: XLSX.WorkSheet;
  constructor(readonly book: XLSX.WorkBook) { }

  useSheet(sheetName: string) {
    this._sheet = this.book.Sheets[sheetName];

    return this._sheet !== undefined;
  }

  get sheet() {
    return this._sheet;
  }

  set(col: string, row: number, value: string): boolean {
    if (!this._sheet) {
      console.warn('worker don\'t have a sheet to use.');
      return false;
    };

    this._sheet[`${col.toUpperCase()}${row}`] = {
      v: value,
      t: 's',
    } as XLSX.CellObject;

    return true;
  }

  get(col: string, row: number): string | undefined {
    if (!this._sheet) {
      console.warn('worker don\'t have a sheet to use.');
      return;
    };

    const cell: unknown = this._sheet[`${col.toUpperCase()}${row}`];

    if (
      typeof cell === 'object' &&
      cell &&
      'v' in cell &&
      cell.v !== undefined &&
      cell.v !== null
    ) {
      return String(cell.v);
    }
  }
}