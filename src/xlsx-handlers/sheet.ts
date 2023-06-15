import { Result, error, unwrap } from "../utils/result";
import { CellAddress } from "./address";
import { CellHandler } from "./cell";
import { LineHander } from "./line";
import { SheetRange } from "./sheet-range";
import XLSX from 'xlsx';

export class SheetHandler {
  cellMap: Map<string, CellHandler>;
  readonly ref: SheetRange;

  constructor(
    readonly sheet: XLSX.WorkSheet
  ) {
    this.cellMap = new Map();
    this.ref = this.generateRef();
  }

  private generateRef() {
    const ref = this.sheet['!ref'];
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

  isCell(cell: XLSX.CellObject | XLSX.WSKeys): cell is XLSX.CellObject {
    return typeof cell === 'object' && 't' in cell;
  }

  safeAt(collumn: string, line: number): Result<CellHandler> {
    const cellAddress = CellAddress.stringify(collumn, line);

    const mappedHandler = this.cellMap.get(cellAddress);

    if (mappedHandler) return mappedHandler;

    const cell: XLSX.CellObject | XLSX.WSKeys = this.sheet[cellAddress] ?? this.createCellObject(cellAddress);

    if (!this.isCell(cell)) return error(`Unespected type of cell: ${cell}`);

    const handler = new CellHandler(cell);

    this.cellMap.set(cellAddress, handler);

    return handler;
  }

  at(collumn: string, line: number) {
    return unwrap(this.safeAt(collumn, line));
  }

  set(collumn: string, line: number) {
    
  }

  *iterLines(start = this.ref.start.line, end = this.ref.end.line + 1): Iterable<LineHander> {
    for (let i = start; i < end; i++) {
      yield new LineHander(this, i);
    }
  }
}