import { getNumOfDaysInMonth, isInteger, thisMonth, thisYear } from '../../../utils';
import { Year } from '../year';

export class Month {
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

  numOfDays(): number {
    return getNumOfDaysInMonth(this.index, this.year);
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