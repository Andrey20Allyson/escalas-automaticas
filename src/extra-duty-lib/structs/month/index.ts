import { isInteger } from '../../../utils';
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

  toString() {
    return `${this.index + 1}/${this.year}`;
  }

  static isValidIndex(month: number) {
    return month >= 0 && month < 12 && isInteger(month);
  }
}

export * from './parser';