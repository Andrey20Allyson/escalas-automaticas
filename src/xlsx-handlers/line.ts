import { Result, unwrap } from "../utils/result";
import type { CellHandler } from "./cell";
import type { SheetHandler } from "./sheet";

export class LineHander {
  constructor(
    readonly sheet: SheetHandler,
    readonly line: number,
  ) { }

  collumnAt(collumn: string): CellHandler {
    return this.sheet.at(collumn, this.line);
  }

  safeCollumnAt(collumn: string): Result<CellHandler> {
    return this.sheet.safeAt(collumn, this.line);
  }
}