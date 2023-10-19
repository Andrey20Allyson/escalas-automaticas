import { Day } from ".";

export class DayParser {
  constructor(
    readonly text: string,
  ) { }

  parse(): Day {
    const numbers = this.text.split('/');
    if (numbers.length !== 3) {
      throw new Error(`Invalid format, expected dd/mm/yy or dd/mm/yyyy recived ${this.text}`);
    }

    const [day, month, year] = numbers.map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Expected numbers, recived ${this.text}`);
    }

    const normalizedYear = this.normalizeYear(year);

    return new Day(normalizedYear, month - 1, day - 1);
  }

  normalizeYear(year: number) {
    return year < 1000 ? year + 2000 : year;
  }
}