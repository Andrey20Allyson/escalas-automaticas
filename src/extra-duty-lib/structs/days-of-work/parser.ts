import { DaysOfWork } from ".";
import { DEFAULT_LICENSE_INTERVAL_PARSER, LicenseIntervalParser } from "./licence-interval";

export interface DaysOfWorkParseData {
  name?: string;
  hourly: string;
  post: string;
  year: number;
  month: number;
}

export const DEFAULT_DAYS_OF_WORK_REGEXP = /\(DIAS:[^\d]*([^]*)\)/;

export interface DaysOfWorkParserConfig {
  daysOfWorkRegExp?: RegExp;
  licenceIntervalParser?: LicenseIntervalParser;
}

export interface IDaysOfWorkParser {
  parse(data: DaysOfWorkParseData): DaysOfWork;
}

export class DaysOfWorkParser implements IDaysOfWorkParser {
  readonly licenceIntervalParser: LicenseIntervalParser;
  readonly daysOfWorkRegExp: RegExp;

  constructor(config: DaysOfWorkParserConfig = {}) {
    this.licenceIntervalParser = config.licenceIntervalParser ?? DEFAULT_LICENSE_INTERVAL_PARSER;
    this.daysOfWorkRegExp = config.daysOfWorkRegExp ?? DEFAULT_DAYS_OF_WORK_REGEXP;
  }

  parse(data: DaysOfWorkParseData): DaysOfWork {
    const {
      hourly,
      month,
      post,
      year,
    } = data;

    const daysOfWork = this.isDailyWorker(hourly)
      ? DaysOfWork.fromDailyWorker(year, month)
      : this.parsePeriodic(data);

    const licenceInterval = this.licenceIntervalParser.parse(post) 
    if (licenceInterval !== null) {
      daysOfWork.applyLicenceInterval(licenceInterval);
    }

    return daysOfWork;
  }

  isDailyWorker(hourly: string) {
    return hourly.includes('2ª/6ª');
  }

  parsePeriodic(data: DaysOfWorkParseData): DaysOfWork {
    const {
      name = 'unknown',
      hourly,
      year,
      month,
    } = data;

    const matches = this.daysOfWorkRegExp.exec(hourly);
    if (!matches) throw new Error(`Can't parse daysOfWork of "${name}", unknown hourly: "${hourly}"`);

    const numbersString = matches.at(1);
    if (!numbersString) throw new Error(`Can't parse daysOfWork of "${name}", unknown hourly: "${hourly}"`);

    const days = numbersString.split(';').map(val => Number(val) - 1);

    return DaysOfWork.fromDays(days, year, month);
  }
}

export const DEFAULT_DAYS_OF_WORK_PARSER = new DaysOfWorkParser();