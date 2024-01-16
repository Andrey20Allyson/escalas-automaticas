import type { ExtraDutyTable, ExtraDutyTableConfig } from './extra-duty-table';
import { WorkerInfo } from './worker-info';
import { ExtraDuty } from './extra-duty';

export interface DayOfExtraDutyFillOptions {
  force?: boolean;
  start?: number;
  end?: number;
}

export class DayOfExtraDuty implements Iterable<ExtraDuty> {
  private readonly duties: readonly ExtraDuty[];
  readonly size: number;
  readonly config: ExtraDutyTableConfig;

  constructor(
    readonly day: number,
    readonly dutyTable: ExtraDutyTable,
  ) {
    this.config = dutyTable.config;
    
    this.size = this.getMaxDuties();

    this.duties = ExtraDuty.dutiesFrom(this);
  }

  [Symbol.iterator](): Iterator<ExtraDuty> {
    return this.duties[Symbol.iterator]();
  }

  getMaxDuties() {
    return Math.floor(24 / this.config.dutyInterval);
  }

  clear() {
    for (const duty of this) {
      duty.clear();
    }
  }

  at(index: number): ExtraDuty | undefined {
    const maxDuties = this.getMaxDuties();

    if (index < 0) {
      const dayIndex = this.day + Math.floor(index / maxDuties);
      if (dayIndex < 0) return; 

      const dayOfExtraDuty = this.dutyTable.getDay(dayIndex);

      return dayOfExtraDuty.getDuty(-index % maxDuties);
    } else if (index >= maxDuties) {
      const nextIndex = index - maxDuties;
      const dayIndex = this.day + Math.ceil((nextIndex + 1) / maxDuties);
      if (dayIndex >= this.dutyTable.width) return;

      const dayOfExtraDuty = this.dutyTable.getDay(dayIndex);

      return dayOfExtraDuty.getDuty(nextIndex % maxDuties);
    }

    return this.getDuty(index);
  }

  canInsert(worker: WorkerInfo, duty: ExtraDuty): boolean;
  canInsert(worker: WorkerInfo, index: number): boolean;
  canInsert(worker: WorkerInfo, arg1: ExtraDuty | number) {
    const duty = this.getDutyFromDutyOrIndex(arg1);

    return duty.canAdd(worker)
      && !this.otherDutiesHasWorker(worker, duty.index)
      && !this.collidesWithLicense(worker)
      && !duty.collidesWithWork(worker);
  }

  collidesWithLicense(worker: WorkerInfo): boolean {
    return worker.daysOfWork.licenseOn(this.day);
  }

  canInsertIn(worker: WorkerInfo, dutyIndex: number) {
    const duty = this.getDuty(dutyIndex);

    return this.canInsert(worker, duty);
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

  fill(worker: WorkerInfo, options: DayOfExtraDutyFillOptions = {}) {
    const {
      start = 0,
      end = this.size,
      force,
    } = options;

    let count = 0;

    for (let i = start; i < end; i++) {
      if (this.insert(worker, i, force)) count++;
    }

    return count;
  }

  insert(worker: WorkerInfo, index: number, force?: boolean): boolean;
  insert(worker: WorkerInfo, duty: ExtraDuty, force?: boolean): boolean;
  insert(worker: WorkerInfo, arg1: ExtraDuty | number, force = false): boolean {
    const duty = this.getDutyFromDutyOrIndex(arg1);

    if (!force && !this.canInsert(worker, duty)) return false;

    return duty.add(worker, true);
  }

  getDutyFromDutyOrIndex(dutyOrIndex: ExtraDuty | number): ExtraDuty {
    return dutyOrIndex instanceof ExtraDuty ? dutyOrIndex : this.getDuty(dutyOrIndex);
  }

  static daysFrom(table: ExtraDutyTable): readonly DayOfExtraDuty[] {
    const duties: DayOfExtraDuty[] = new Array(table.width);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new this(i, table);
    }

    return duties;
  }
}