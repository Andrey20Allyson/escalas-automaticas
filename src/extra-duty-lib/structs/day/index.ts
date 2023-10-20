import { getNumOfDaysInMonth } from "../../../utils";

export class Day {
  constructor(
    readonly year: number,
    readonly month: number,
    readonly index: number,
  ) { }

  static fromLastOf(year: number, month: number): Day {
    return new Day(
      year,
      month,
      Day.lastOf(year, month),
    );
  }

  static lastOf(year: number, month: number): number {
    return getNumOfDaysInMonth(month, year);
  }
}

export * from './parser';