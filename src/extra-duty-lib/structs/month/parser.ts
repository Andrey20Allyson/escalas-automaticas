import { Month } from ".";
import { Year } from "../year";

export interface MonthParserConfig {
  separator?: string;
}

export const DEFAULT_SEPARATOR = '/';

export class MonthParser {
  readonly separator: string;

  constructor(config: MonthParserConfig = {}) {
    this.separator = config.separator ?? DEFAULT_SEPARATOR;
  }

  parse(data: string): Month {
    const numbers = data.split(this.separator);
    if (numbers.length !== 2) {
      throw new Error(`Invalid format, expected mm${this.separator}yy or mm${this.separator}yyyy recived ${data}`);
    }

    const [month, year] = numbers.map(Number);

    if (isNaN(month) || isNaN(year)) {
      throw new Error(`Expected numbers, recived ${data}`);
    }

    const normalizedYear = Year.normalize(year);

    return new Month(normalizedYear, month - 1);
  }
}

export const DEFAULT_MONTH_PARSER = new MonthParser();