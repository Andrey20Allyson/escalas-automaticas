import { DaysOfWork } from ".";
import { DEFAULT_LICENCE_INTERVAL_PARSER, LicenceIntervalParser } from "./licence-interval";

export interface DayOfWorkParseData {
  name?: string;
  hourly: string;
  post: string;
  year: number;
  month: number;
}

export const DEFAULT_DAYS_OF_WORK_REGEXP = /\(DIAS:[^\d]*([^]*)\)/;

export interface DaysOfWorkParserConfig {
  daysOfWorkRegExp?: RegExp;
  licenceIntervalParser?: LicenceIntervalParser;
}

export class DaysOfWorkParser {
  readonly licenceIntervalParser: LicenceIntervalParser;
  readonly daysOfWorkRegExp: RegExp;

  constructor(config: DaysOfWorkParserConfig = {}) {
    this.licenceIntervalParser = config.licenceIntervalParser ?? DEFAULT_LICENCE_INTERVAL_PARSER;
    this.daysOfWorkRegExp = config.daysOfWorkRegExp ?? DEFAULT_DAYS_OF_WORK_REGEXP;
  }

  parse(data: DayOfWorkParseData): DaysOfWork {
    const {
      name = 'unknown',
      hourly,
      month,
      post,
      year,
    } = data;

    const daysOfWork = hourly.includes('2ª/6ª')
      ? DaysOfWork.fromDailyWorker(year, month)
      : this.parsePeriodic(hourly, year, month);

    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${name}", unknown hourly: "${hourly}"`);

    for (const medicalDischargeDay of this.iterDaysUnableToWorkOnExtra(post, year, month)) {
      daysOfWork.work(medicalDischargeDay);
    }

    return daysOfWork;
  }

  parsePeriodic(hourly: string, year: number, month: number): DaysOfWork | undefined {
    const matches = this.daysOfWorkRegExp.exec(hourly);
    if (!matches) return;

    const numbersString = matches.at(1);
    if (!numbersString) return;

    const days = numbersString.split(';').map(val => Number(val) - 1);

    return DaysOfWork.fromDays(days, year, month);
  }

  *iterDaysUnableToWorkOnExtra(post: string, year: number, month: number): Iterable<number> {
    const licenceInterval = this.licenceIntervalParser.parse(post);
    if (licenceInterval === null) return;

    const first = licenceInterval.getFirstDayInMonth(year, month);
    const last = licenceInterval.getLastDayInMonth(year, month);

    for (let i = first; i <= last; i++) {
      yield i;
    }
  }
}

export const DEFAULT_DAYS_OF_WORK_PARSER = new DaysOfWorkParser();