import { Day } from ".";
import { DEFAULT_MONTH_PARSER, MonthParser } from "../month";

export interface DayParserConfig {
  monthParser?: MonthParser;
}

export class DayParser {
  readonly monthParser: MonthParser;

  constructor(config: DayParserConfig = {}) {
    this.monthParser = config.monthParser ?? DEFAULT_MONTH_PARSER;
  }

  parse(text: string): Day {
    const numbers = text.split('/');
    if (numbers.length !== 3) {
      throw new Error(`Invalid format, expected dd/mm/yy or dd/mm/yyyy recived ${text}`);
    }

    const [day, month, year] = numbers.map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Expected numbers, recived ${text}`);
    }

    return new Day(year, month - 1, day - 1);
  }
}

export const DEFAULT_DAY_PARSER = new DayParser();