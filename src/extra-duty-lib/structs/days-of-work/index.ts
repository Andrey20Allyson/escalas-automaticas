import { enumerate, firstMondayFromYearAndMonth, getNumOfDaysInMonth, isBusinessDay } from "../../../utils";
import { Holidays } from "../holidays";
import { Clonable } from "../worker-info";
import { LicenseInterval } from "./licence-interval";

export class DaySearch {
  constructor(
    public past: number = 0,
    public next: number = 0,
  ) { }

  step() {
    this.past--;
    this.next++;
  }

  static fromDay(day: number) {
    return new this(day, day);
  }
}

export interface DayOfWork {
  day: number;
  work: boolean;
}

export class DaysOfWork implements Clonable<DaysOfWork> {
  private readonly days: boolean[];
  private numOfDaysOff: number;

  readonly length: number;

  constructor(readonly year: number, readonly month: number, startValue = false, readonly isDailyWorker: boolean = false) {
    this.days = new Array(getNumOfDaysInMonth(month, year)).fill(startValue);

    this.length = this.days.length;

    this.numOfDaysOff = startValue ? 0 : this.length;
  }

  clone() {
    const clone = new DaysOfWork(this.year, this.month, false, this.isDailyWorker);

    for (let i = 0; i < this.days.length; i++) {
      clone.setDayOfWork(i, this.workOn(i));
    }

    clone.numOfDaysOff = this.numOfDaysOff;

    return clone;
  }

  getNumOfDaysOff() {
    return this.numOfDaysOff;
  }

  work(day: number) {
    this.setDayOfWork(day, true);
  }

  setDayOfWork(day: number, work: boolean) {
    if (day < 0 || day >= this.length || this.days[day] === work) return;

    this.numOfDaysOff += work ? -1 : 1;
    this.days[day] = work;
  }

  switchDayOfWork(day: number) {
    this.setDayOfWork(day, !this.workOn(day));
  }

  *entries(): Iterable<DayOfWork> {
    for (const [day, work] of enumerate(this.days)) {
      yield { day, work };
    }
  }

  values(): Iterable<boolean> {
    return this.days.values();
  }

  addHolidays(holidays: Holidays, month: number): void {
    const monthHolidays = holidays.get(month);

    for (const holiday of monthHolidays) {
      const day = holiday.day;

      if (day >= 0 && day < this.days.length) {
        this.notWork(day);
      }
    }
  }

  applyLicenceInterval(licenceInterval: LicenseInterval) {
    for (const day of licenceInterval.iterDaysInMonth(this.year, this.month)) {
      this.work(day);
    }
  }

  searchClosestDayOff(search: DaySearch): number | undefined {
    if (search.next === search.past && !this.workOn(search.next)) {
      const day = search.next;

      search.step();

      return day;
    }

    while (search.past >= 0 || search.next < this.length) {
      search.step();

      if (search.past >= 0 && !this.workOn(search.past)) return search.past;
      if (search.next < this.length && !this.workOn(search.next)) return search.next;
    }
  }

  notWork(day: number) {
    this.setDayOfWork(day, false);
  }

  workOn(day: number): boolean {
    return this.days.at(day) === true;
  }

  static fromAllDays(year: number, month: number) {
    return new this(year, month, true);
  }

  static fromDays(days: number[], year: number, month: number): DaysOfWork {
    const daysOfWork = new this(year, month);

    for (const day of days) {
      daysOfWork.work(day);
    }

    return daysOfWork;
  }

  static fromDailyWorker(year: number, month: number) {
    const daysInThisMonth = getNumOfDaysInMonth(month, year);
    const daysOfWork = new this(year, month, false, true);

    const firstMonday = firstMondayFromYearAndMonth(year, month);

    for (let i = 0; i < daysInThisMonth; i++) {
      if (isBusinessDay(firstMonday, i)) {
        daysOfWork.work(i);
      }
    }

    return daysOfWork;
  }
}

export * from './parser';