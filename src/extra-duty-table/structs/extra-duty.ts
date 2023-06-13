import type { ExtraDutyTableConfig } from "..";
import { WorkerInfo } from "../worker-info";
import type { DayOfExtraDuty } from "./day-of-extra-duty";

export class ExtraDuty implements Iterable<[string, WorkerInfo]> {
  readonly workers: Map<string, WorkerInfo>;
  readonly offTimeEnd: number;
  readonly start: number;
  readonly end: number;

  constructor(
    readonly day: number,
    readonly index: number,
    readonly config: ExtraDutyTableConfig
  ) {
    this.workers = new Map();

    this.start = config.firstDutyTime + config.dutyInterval * index;
    this.end = this.start + this.config.dutyDuration;
    this.offTimeEnd = this.end + this.config.dutyDuration;
  }

  collidesWithWork(worker: WorkerInfo) {
    return this.collidesWithTodayWork(worker)
      || this.collidesWithYesterdayWork(worker)
      || this.collidesWithTommorowWork(worker);
  }

  collidesWithTodayWork(worker: WorkerInfo) {
    const workToday = worker.daysOfWork.workOn(this.day);
    if (!workToday) return false;

    const workStart = worker.workTime.startTime;

    return this.offTimeEnd > workStart;
  }

  collidesWithTommorowWork(worker: WorkerInfo) {
    const workYesterday = worker.daysOfWork.workOn(this.day - 1);
    if (!workYesterday) return false;

    const yesterdayWorkOffTimeEnd = worker.workTime.startTime + worker.workTime.totalTime * 2;

    return yesterdayWorkOffTimeEnd - 24 > this.start;
  }

  collidesWithYesterdayWork(worker: WorkerInfo) {
    const workTomorrow = worker.daysOfWork.workOn(this.day + 1);
    if (!workTomorrow) return false;

    const tomorrowWorkStart = worker.workTime.startTime + 24;

    return this.offTimeEnd > tomorrowWorkStart;
  }

  [Symbol.iterator](): Iterator<[string, WorkerInfo]> {
    return this.workers[Symbol.iterator]();
  }

  isFull() {
    return this.getSize() >= this.config.dutyCapacity;
  }

  has(worker: WorkerInfo) {
    return this.workers.has(worker.name);
  }

  getSize() {
    return this.workers.size;
  }

  canAdd(worker: WorkerInfo) {
    return !worker.isCompletelyBusy(this.config.dutyPositionSize)
      && !this.isFull()
      && !this.has(worker);
  }

  add(worker: WorkerInfo, force = false): boolean {
    if (!force && !this.canAdd(worker)) return false;

    this.workers.set(worker.name, worker);

    worker.occupyPositions(this.config.dutyPositionSize);

    return true;
  }

  clear() {
    for (const [_, worker] of this) {
      worker.leavePositions(this.config.dutyPositionSize);
    }

    this.workers.clear();
  }

  static dutiesFrom(day: DayOfExtraDuty): readonly ExtraDuty[] {
    const duties: ExtraDuty[] = new Array(day.size);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(day.day, i, day.config);
    }

    return duties;
  }
}