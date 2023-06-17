import { ResultType, ResultError, Result } from "../utils/result";
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
    return Result.unwrap(this.safeParse(value));
  }

  static safeParse(value: string): ResultType<SheetRange> {
    const addresses = value.split(':');
    if (addresses.length !== 2) return new InvalidSheetRangeError(value);

    const result = Result.all(addresses.map(CellAddress.parse.bind(CellAddress)));
    if (ResultError.isError(result)) return result;

    const [start, end] = result;

    return new this(start, end);
  }
}