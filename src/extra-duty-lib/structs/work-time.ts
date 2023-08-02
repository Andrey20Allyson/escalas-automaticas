import { Clonable } from "./worker-info";

export const WORK_TIME_REGEXP = /(\d{2}) ÀS (\d{2})h/;

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

    const [_, start, end] = matches as unknown as [string, ...(string | undefined)[]];

    const parsedStart = Number(start);
    const parsedEnd = Number(end);

    return new WorkTime(
      parsedStart,
      parsedEnd < parsedStart ? parsedStart - parsedEnd : parsedEnd - parsedStart,
    );
  }
}