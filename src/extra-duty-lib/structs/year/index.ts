import { isInteger, thisYear } from "../../../utils";

export class Year {
  readonly index: number;
  
  constructor(
    index: number
  ) {
    if (!Year.isValidIndex(index)) {
      throw new Error(`Value ${index} don't is a valid year!`);
    }

    this.index = Year.normalize(index);
  }

  static isValidIndex(year: number) {
    return isInteger(year);
  }

  static normalize(year: number): number {
    return year < 1000 ? year + 2000 : year;
  }

  static now(): Year {
    return new Year(thisYear);
  }
}