import { Weekend, firstMonday, firstMondayFromYearAndMonth, getNumOfDaysInMonth, isInteger, thisMonth, thisYear } from '../../../utils';
import { Year } from '../year';

export class Month {
  private _numOfDays: number | null = null;
  private _firstMonday: number | null = null;
  readonly year: number;

  constructor(
    year: number,
    readonly index: number,
  ) {
    this.year = new Year(year).index;

    if (!Month.isValidIndex(index)) {
      throw new Error(`value ${index} don't is a valid month!`);
    }
  }

  getNumOfDays(): number {
    if (this._numOfDays === null) this._numOfDays = getNumOfDaysInMonth(this.index, this.year);

    return this._numOfDays;
  }

  includes(day: number): boolean {
    return day >= 0 && day < this.getNumOfDays();
  }

  getFirstMonday() {
    if (this._firstMonday === null) this._firstMonday = firstMondayFromYearAndMonth(this.year, this.index);

    return this._firstMonday;
  }

  *iterWeekends() {
    let firstSaturday = this.getFirstMonday() - 2;

    for (let i = 0; i < 5; i++) {
      const weekend: Weekend = {};

      let saturday = firstSaturday + 7 * i;
      let sunday = saturday + 1;
      let canYield = false;

      if (this.includes(saturday)) {
        weekend.saturday = saturday;
        canYield = true;
      }

      if (this.includes(sunday)) {
        weekend.sunday = sunday;
        canYield = true;
      }

      if (canYield) {
        yield weekend;
      } else {
        continue;
      }
    }
  }

  toString() {
    return `${this.index + 1}/${this.year}`;
  }

  static isValidIndex(month: number) {
    return month >= 0 && month < 12 && isInteger(month);
  }

  static now(): Month {
    return new Month(thisYear, thisMonth);
  }
}

export * from './parser';