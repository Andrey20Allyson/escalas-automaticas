import { DayOfWeek, dayOfWeekFrom, getNumOfDaysInMonth, isInteger, isWeekEnd, thisMonth, thisYear } from "../../../utils";
import { Month } from "../month";

export class Day {
  private readonly _month: Month;
  private _weekDay: number | null = null;

  constructor(
    year: number,
    month: number,
    readonly index: number,
  ) {
    this._month = new Month(year, month);

    if (!Day.isValidIndex(this.year, this.month, this.index)) {
      throw new Error(`value ${this.index} don't is a valid day of month ${this._month.toString()}`);
    }
  }

  get year() {
    return this._month.year;
  }

  get month() {
    return this._month.index;
  }

  isBefore(other: Day): boolean {
    if (this.year > other.year) {
      return false;
    }

    if (this.month > other.month) {
      return false;
    }

    return this.index < other.index;
  }

  isAfter(other: Day): boolean {
    if (this.year < other.year) {
      return false;
    }

    if (this.month < other.month) {
      return false;
    }

    return this.index > other.index;
  }

  sumIndex(days: number): Day {
    return new Day(
      this.year,
      this.month,
      this.index + days,
    );
  }

  subIndex(days: number): Day {
    return new Day(
      this.year,
      this.month,
      this.index - days,
    );
  }

  getWeekDay(): DayOfWeek {
    let weekDay = this._weekDay;
    if (weekDay === null) return this._weekDay = dayOfWeekFrom(this._month.getFirstMonday(), this.index);

    return weekDay;
  }

  isWeekEnd(): boolean {
    return isWeekEnd(this.getWeekDay());
  }

  static fromLastOf(year: number, month: number): Day {
    return new Day(
      year,
      month,
      Day.lastOf(year, month),
    );
  }

  static lastOf(year: number, month: number): number {
    return getNumOfDaysInMonth(month, year) - 1;
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
