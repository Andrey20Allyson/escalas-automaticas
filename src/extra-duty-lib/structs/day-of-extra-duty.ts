import type { ExtraDutyTable, ExtraDutyTableConfig } from './extra-duty-table';
import { WorkerInfo } from './worker-info';
import { ExtraDuty } from './extra-duty';

export interface DayOfExtraDutyFillOptions {
  start?: number;
  end?: number;
}

export class DayOfExtraDuty implements Iterable<ExtraDuty> {
  private readonly duties: readonly ExtraDuty[];
  private readonly size: number;
  readonly config: ExtraDutyTableConfig;

  constructor(
    readonly index: number,
    readonly table: ExtraDutyTable,
  ) {
    this.config = table.config;
    
    this.size = this.getMaxDuties();

    this.duties = ExtraDuty.dutiesFrom(this);
  }

  [Symbol.iterator](): Iterator<ExtraDuty> {
    return this.duties[Symbol.iterator]();
  }

  clear(place?: string) {
    for (const duty of this) {
      duty.clear(place);
    }
  }

  getSize() {
    return this.size;
  }

  at(index: number): ExtraDuty | undefined {
    const maxDuties = this.getMaxDuties();

    if (index < 0) {
      const dayIndex = this.index + Math.floor(index / maxDuties);
      if (dayIndex < 0) return; 

      const dayOfExtraDuty = this.table.getDay(dayIndex);

      return dayOfExtraDuty.getDuty(-index % maxDuties);
    } else if (index >= maxDuties) {
      const nextIndex = index - maxDuties;
      const dayIndex = this.index + Math.ceil((nextIndex + 1) / maxDuties);
      if (dayIndex >= this.table.width) return;

      const dayOfExtraDuty = this.table.getDay(dayIndex);

      return dayOfExtraDuty.getDuty(nextIndex % maxDuties);
    }

    return this.getDuty(index);
  }

  getDuty(dutyIndex: number): ExtraDuty {
    const maxDuties = this.getMaxDuties();
    if (dutyIndex < 0 || dutyIndex >= maxDuties) throw new Error(`Out of bount trying access item ${dutyIndex}, limit: ${maxDuties}`);

    const duty = this.duties.at(dutyIndex);
    if (!duty) throw new Error(`Value at ${dutyIndex} is undefined!`);

    return duty;
  }

  includes(worker: WorkerInfo, start: number, end: number, place?: string): boolean {
    for (let i = start; i < end; i++) {
      if (this.has(worker, i, place)) return true;
    }

    return false;
  }

  has(worker: WorkerInfo, dutyIndex: number, place?: string): boolean {
    return this.at(dutyIndex)?.has(worker, place) ?? false;
  }

  private getMaxDuties() {
    return Math.floor(24 / this.config.dutyInterval);
  }

  static daysFrom(table: ExtraDutyTable): readonly DayOfExtraDuty[] {
    const duties: DayOfExtraDuty[] = new Array(table.width);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new this(i, table);
    }

    return duties;
  }
}