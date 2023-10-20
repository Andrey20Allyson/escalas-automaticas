import { getNumOfDaysInMonth, isInteger, thisMonth, thisYear } from "../../../utils";
import { Month } from "../month";

export class Day {
  readonly year: number;
  readonly month: number;

  constructor(
    year: number,
    month: number,
    readonly index: number,
  ) {
    const validMonth = new Month(year, month);

    this.year = validMonth.year;
    this.month = validMonth.index;

    if (!Day.isValidIndex(this.year, this.month, this.index)) {
      throw new Error(`value ${this.index} don't is a valid day of month ${validMonth.toString()}`);
    }
  }

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

  static isValidIndex(year: number, month: number, day: number) {
    return isInteger(day) && day >= 0 && day <= Day.lastOf(year, month); 
  }

  static now(): Day {
    return new Day(
      thisYear,
      thisMonth,
      new Date().getDate(),
    );
  }
}

export * from './parser';
