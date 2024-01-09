import { Clonable } from "../worker-info";

export class WorkTime implements Clonable<WorkTime> {
  constructor(
    readonly startTime: number,
    readonly totalTime: number,
  ) { }

  clone() {
    return new WorkTime(this.startTime, this.totalTime);
  }

  equals(workTime: WorkTime) {
    return this.startTime === workTime.startTime
      && this.totalTime === workTime.totalTime;
  }

  static from(start: number, end: number): WorkTime {
    return new WorkTime(
      start,
      end < start ? start - end : end - start,
    );
  }
}