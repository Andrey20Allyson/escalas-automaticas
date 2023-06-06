import type { ExtraDutyTable } from '..';
import { WorkerInfo } from '../worker-info';
import { ExtraDuty } from './extra-duty';

export class DayOfExtraDuty implements Iterable<ExtraDuty> {
  private readonly duties: readonly ExtraDuty[];
  readonly size: number;

  get config() {
    return this.dutyTable.config;
  }

  constructor(
    readonly day: number,
    readonly dutyTable: ExtraDutyTable,
  ) {
    this.size = this.getMaxDuties();

    this.duties = ExtraDuty.arrayFrom(this);
  }

  [Symbol.iterator](): Iterator<ExtraDuty> {
    return this.duties[Symbol.iterator]();
  }

  getMaxDuties() {
    return Math.floor(24 / this.config.dutyInterval);
  }

  at(index: number): ExtraDuty | undefined {
    const maxDuties = this.getMaxDuties();

    if (index < 0) {
      const dayOfExtraDuty = this.dutyTable.getDay(this.day + Math.floor(index / maxDuties));

      if (index + maxDuties < 0) return;

      return dayOfExtraDuty.getDuty(maxDuties + index);
    } else if (index >= maxDuties) {
      const dayOfExtraDuty = this.dutyTable.getDay(this.day + Math.ceil((index - maxDuties + 1) / maxDuties));

      if (index - maxDuties >= maxDuties) return;

      return dayOfExtraDuty.getDuty(index - maxDuties);
    }

    return this.getDuty(index);
  }

  canInsert(worker: WorkerInfo, duty: ExtraDuty) {
    return !duty.isFull()
      && !duty.has(worker)
      && !this.otherDutiesHasWorker(worker, duty.index)
      && !duty.collidesWithWork(worker);
  }

  getDuty(dutyIndex: number): ExtraDuty {
    const maxDuties = this.getMaxDuties();
    if (dutyIndex < 0 || dutyIndex >= maxDuties) throw new Error(`Out of bount trying access item ${dutyIndex}, limit: ${maxDuties}`);

    const duty = this.duties.at(dutyIndex);
    if (!duty) throw new Error(`Value at ${dutyIndex} is undefined!`);

    return duty;
  }

  workedAtInterval(worker: WorkerInfo, start: number, end: number) {
    for (let i = start; i < end; i++) {
      if (this.at(i)?.has(worker)) return true;
    }

    return false;
  }

  otherDutiesHasWorker(worker: WorkerInfo, searchStart: number) {
    if (this.config.dutyMinDistance < 1) throw new Error(`Distance can't be smaller than 1! distance: ${this.config.dutyMinDistance}`);

    const nextIndex = searchStart + 1;

    return this.workedAtInterval(worker, searchStart - this.config.dutyMinDistance, searchStart)
      || this.workedAtInterval(worker, nextIndex, nextIndex + this.config.dutyMinDistance);
  }

  insert(worker: WorkerInfo, dutyIndex: number): boolean {
    const duty = this.getDuty(dutyIndex);

    if (!this.canInsert(worker, duty)) return false;

    duty.add(worker);

    return true;
  }
}