import { Result, ResultError } from "../utils/result";
import { firstNumberIndex } from "../utils/string";

export class InvalidCellAddressError extends ResultError {
  constructor(address: string) {
    super(`Invalid cell address "${address}"`);
  }
}

export class CellAddress {
  constructor(
    readonly collumn: string,
    readonly line: number,
  ) { }

  stringify() {
    return CellAddress.stringify(this.collumn, this.line);
  }

  static stringify(collumn: string, line: number) {
    return collumn.toUpperCase() + line.toString();
  }

  static parse(value: string): Result<CellAddress> {
    value = value.toUpperCase();
    if (value.length < 2) return new InvalidCellAddressError(value);

    let lineStart = firstNumberIndex(value);
    if (lineStart === -1) return new InvalidCellAddressError(value);

    const collumn = value.slice(0, lineStart);
    const line = +value.slice(lineStart);

    if (isNaN(line)) return new InvalidCellAddressError(value);

    return new this(collumn, line);
  }
}