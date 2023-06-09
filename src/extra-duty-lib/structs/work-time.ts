import { Clonable } from "./worker-info";

export const WORK_TIME_REGEXP = /^(\d{2})[^\d]*(\d{2})/;

export class WorkTime implements Clonable<WorkTime> {
  constructor(
    readonly startTime: number,
    readonly totalTime: number,
  ) { }

  clone() {
    return new WorkTime(this.startTime, this.totalTime);
  }

  static parse(text: string): WorkTime | undefined {
    const matches = WORK_TIME_REGEXP.exec(text);
    if (!matches) return;

    const start = matches.at(1);
    const end = matches.at(2);
    if (!start || !end) return undefined;

    const parsedStart = Number(start);
    const parsedEnd = Number(end);

    return new WorkTime(
      parsedStart,
      parsedEnd < parsedStart ? parsedStart - parsedEnd : parsedEnd - parsedStart,
    );
  }
}