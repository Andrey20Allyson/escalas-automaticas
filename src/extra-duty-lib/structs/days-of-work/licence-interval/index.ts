import { Day } from "../../day";

export class LicenseInterval {
  constructor(
    readonly start: Day | null,
    readonly end: Day,
  ) { }

  getFirstDayInMonth(year: number, month: number): number {
    if (this.start === null) return 0;

    if (this.start.month > month) {
      return Day.lastOf(year, month);
    }

    if (this.start.month < month) {
      return 0;
    }

    return this.start.index;
  }

  getLastDayInMonth(year: number, month: number): number {
    if (this.end.month > month) {
      return Day.lastOf(year, month);
    }

    if (this.end.month < month) {
      return -1;
    }

    return this.end.index;
  }
}

export * from './parser';