import { Day } from ".";
import { Year } from "../year";

export class DayParser {
  parse(text: string): Day {
    const numbers = text.split('/');
    if (numbers.length !== 3) {
      throw new Error(`Invalid format, expected dd/mm/yy or dd/mm/yyyy recived ${text}`);
    }

    const [day, month, year] = numbers.map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Expected numbers, recived ${text}`);
    }

    const normalizedYear = Year.normalize(year);

    return new Day(normalizedYear, month - 1, day - 1);
  }
}

export const DEFAULT_DAY_PARSER = new DayParser();