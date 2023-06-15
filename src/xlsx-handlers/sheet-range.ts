import { Result, ResultError, isError, resultFrom, unwrap } from "../utils/result";
import { CellAddress } from "./address";

export class InvalidSheetRangeError extends ResultError {
  constructor(range: string) {
    super(`Invalid sheet range "${range}"`);
  }
}

export class SheetRange {
  constructor(
    readonly start: CellAddress,
    readonly end: CellAddress,
  ) { }

  static parse(value: string) {
    return unwrap(this.safeParse(value));
  }

  static safeParse(value: string): Result<SheetRange> {
    const addresses = value.split(':');
    if (addresses.length !== 2) return new InvalidSheetRangeError(value);

    const result = resultFrom(addresses.map(CellAddress.parse.bind(CellAddress)));
    if (isError(result)) return result;

    const [start, end] = result;

    return new this(start, end);
  }
}