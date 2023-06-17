import { ResultType, Result, ResultError } from "../utils/result";
import type { CellHandler, CellTypeMap, CellTypes } from "./cell";
import type { SheetHandler } from "./sheet";

export class LineHander {
  constructor(
    readonly sheet: SheetHandler,
    readonly line: number,
  ) { }

  at(collumn: string): CellHandler {
    return this.sheet.at(collumn, this.line);
  }

  safeAt(collumn: string): ResultType<CellHandler> {
    return this.sheet.safeAt(collumn, this.line);
  }

  getCells<C extends readonly string[] | []>(collumns: C) {
    return Result.unwrap(this.safeGetCells(collumns));
  }

  static collumnTuple<T extends string[] | []>(tuple: T): T {
    return tuple;
  }

  safeGetCells<C extends readonly string[] | []>(collumns: C): ResultType<{ -readonly [K in keyof C]: CellHandler }> {
    let cells: CellHandler[] = new Array(collumns.length);

    for (let i = 0; i < collumns.length; i++) {
      const result = this.safeAt(collumns[i]);

      if (ResultError.isError(result)) return result;

      cells[i] = result;
    }

    return cells as { -readonly[K in keyof C]: CellHandler };
  }
}