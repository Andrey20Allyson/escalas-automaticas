import { Result, ResultError, ResultType } from "../utils/result";
import { CellAddress } from "./address";
import { CellHandler } from "./cell";
import { LineHander } from "./line";
import { SheetRange } from "./sheet-range";
import * as XLSX from 'xlsx';

export class SheetHandler {
  private cellMap: Map<string, CellHandler>;
  readonly ref: SheetRange;

  constructor(
    readonly sheet: XLSX.WorkSheet
  ) {
    this.cellMap = new Map();
    this.ref = SheetHandler.generateRef(this.sheet);
  }

  static generateRef(sheet: XLSX.WorkSheet) {
    const ref = sheet['!ref'];
    if (!ref) return new SheetRange(
      new CellAddress('a', 1),
      new CellAddress('a', 1),
    );

    return SheetRange.parse(ref);
  }

  private createCellObject(address: string) {
    const cell: XLSX.CellObject = {
      t: 'z',
      z: 'General',
      s: { patternType: 'none' },
    }

    this.sheet[address] = cell;

    return cell;
  }

  isCellObject(cell: XLSX.CellObject | XLSX.WSKeys): cell is XLSX.CellObject {
    return typeof cell === 'object' && 't' in cell;
  }

  safeAt(collumn: string, line: number): ResultType<CellHandler> {
    const cellAddress = CellAddress.stringify(collumn, line);

    const mappedHandler = this.cellMap.get(cellAddress);
    if (mappedHandler) return mappedHandler;

    const cell: XLSX.CellObject | XLSX.WSKeys = this.sheet[cellAddress] ?? this.createCellObject(cellAddress);
    if (!this.isCellObject(cell)) return ResultError.create(`Unespected type of cell: ${cell}`);

    const handler = new CellHandler(cell);

    this.cellMap.set(cellAddress, handler);

    return handler;
  }

  lineAt(line: number): LineHander {
    return new LineHander(this, line);
  }

  at(collumn: string, line: number) {
    return Result.unwrap(this.safeAt(collumn, line));
  }

  *iterLines(start = this.ref.start.line, end = this.ref.end.line + 1): Iterable<LineHander> {
    for (let i = start; i < end; i++) {
      yield this.lineAt(i);
    }
  }
}