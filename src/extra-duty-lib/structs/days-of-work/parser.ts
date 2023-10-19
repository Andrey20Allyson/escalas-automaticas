import { DaysOfWork } from ".";
import { parseNumberOrThrow } from "../../../utils";
import { Day } from "../day";

export interface DayOfWorkParseData {
  name?: string;
  hourly: string;
  post: string;
  year: number;
  month: number;
}

export interface LicenseInterval {
  start: Day | null;
  end: Day;
}

export const DAYS_OF_WORK_REGEXP = /\(DIAS:[^\d]*([^]*)\)/;
export const MEDICAL_LICENCE_REGEXP = /LICENÇA MÉDICA \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;// /DISP\. MÉDICA DE (\d{2}) À (\d{2})/;
export const PREMIUM_LICENCE_REGEXP = /LICENÇA PRÊMIO \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;

export class DaysOfWorkParser {
  constructor(
    readonly data: DayOfWorkParseData
  ) { }

  parse(): DaysOfWork {
    const {
      name = 'unknown',
      hourly,
      month,
      year,
    } = this.data;

    const daysOfWork = hourly.includes('2ª/6ª')
      ? DaysOfWork.fromDailyWorker(year, month)
      : this.parsePeriodic();

    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${name}", unknown hourly: "${hourly}"`);

    for (const medicalDischargeDay of this.iterDaysUnableToWorkOnExtra()) {
      daysOfWork.work(medicalDischargeDay);
    }

    return daysOfWork;
  }

  parsePeriodic(): DaysOfWork | undefined {
    const matches = DAYS_OF_WORK_REGEXP.exec(this.data.hourly);
    if (!matches) return;

    const numbersString = matches.at(1);
    if (!numbersString) return;

    const days = numbersString.split(';').map(val => Number(val) - 1);

    return DaysOfWork.fromDays(days, this.data.year, this.data.month);
  }

  *iterDaysUnableToWorkOnExtra(): Iterable<number> {
    const matches = MEDICAL_LICENCE_REGEXP.exec(this.data.hourly);
    if (!matches) return;

    const [_, startDay, endDay] = matches as [string, string?, string?];

    const startDayNumber = parseNumberOrThrow(startDay) - 1;
    const endDayNumber = parseNumberOrThrow(endDay) - 1;

    for (let i = startDayNumber; i <= endDayNumber; i++) {
      yield i;
    }
  }

  parseLicenceInterval(): LicenseInterval | null {
    const matches = MEDICAL_LICENCE_REGEXP.exec(this.data.post)
      ?? PREMIUM_LICENCE_REGEXP.exec(this.data.post);

    if (!matches) return null;

    const rawStartDay = matches.at(2);
    const rawEndDay = matches.at(3);
    if (rawEndDay === undefined) throw new Error(`Can't find a license end day in '${this.data.post}', expected a 'ATÉ dd/mm/yy' or 'ATÉ dd/mm/yyyy'`);

    return {
      start: rawStartDay === undefined ? null : Day.parse(rawStartDay),
      end: Day.parse(rawEndDay),
    }
  }
}

