import { Clonable } from "../worker-info";

export class WorkTime implements Clonable<WorkTime> {
  readonly end: number;
  readonly offTimeEnd: number;

  constructor(
    readonly start: number,
    readonly duration: number,
  ) {
    this.end = this.start + this.duration;
    this.offTimeEnd = this.end + this.duration;
  }

  clone() {
    return new WorkTime(this.start, this.duration);
  }

  equals(workTime: WorkTime) {
    return this.start === workTime.start
      && this.duration === workTime.duration;
  }

  static from(start: number, end: number): WorkTime {
    return new WorkTime(
      start,
      end < start ? start - end : end - start,
    );
  }
}