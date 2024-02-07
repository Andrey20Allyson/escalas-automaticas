import { DayOfWeek, dayOfWeekFrom } from '../../utils';
import { ExtraDuty } from './extra-duty';
import type { ExtraDutyTable, ExtraDutyTableConfig } from './extra-duty-table';
import { Month } from './month';
import { WorkerInfo } from './worker-info';

export interface DayOfExtraDutyFillOptions {
  start?: number;
  end?: number;
}

export class ExtraDutyArray extends Array<ExtraDuty> {
  someIsFull(): boolean {
    for (const duty of this) {
      if (duty.isFull()) return true;
    }

    return false;
  }

  add(worker: WorkerInfo): this {
    this.forEach(duty => duty.add(worker));

    return this;
  }

  static fromIter(iterable: Iterable<ExtraDuty>): ExtraDutyArray {
    return new this(...iterable);
  }
}

export class ExtraDutiesPair implements Iterable<ExtraDutyArray> {
  private readonly _daytime: ExtraDutyArray = new ExtraDutyArray();
  private readonly _nighttime: ExtraDutyArray = new ExtraDutyArray();

  add(duty: ExtraDuty): this {
    if (duty.isNighttime()) {
      this._nighttime.push(duty);

      return this;
    }

    this._daytime.push(duty);

    return this;
  }

  daytime(): ExtraDutyArray {
    return this._daytime;
  }

  nighttime(): ExtraDutyArray {
    return this._nighttime;
  }

  all(): ExtraDutyArray {
    return new ExtraDutyArray(...this._daytime, ...this._nighttime);
  }

  *[Symbol.iterator](): Iterator<ExtraDutyArray> {
    yield this.daytime();
    yield this.nighttime();
  }
}

export class DayOfExtraDuty implements Iterable<ExtraDuty> {
  private readonly duties: readonly ExtraDuty[];
  private readonly size: number;
  readonly config: ExtraDutyTableConfig;
  readonly weekDay: number;
  readonly month: Month;

  constructor(
    readonly index: number,
    readonly table: ExtraDutyTable,
  ) {
    this.config = table.config;
    this.month = table.month;
    this.weekDay = dayOfWeekFrom(this.month.getFirstMonday(), this.index);

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

  pair(offset: number = 1): ExtraDutiesPair {
    const pair = new ExtraDutiesPair();
    const end = this.size + offset;

    for (let i = offset; i < end; i++) {
      const duty = this.at(i);
      if (duty === undefined || duty.day.isLast() && duty.isLast()) continue;

      pair.add(duty);
    }

    return pair;
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

  isWeekDay(weekDay: DayOfWeek): boolean {
    return this.weekDay === weekDay;
  }

  isLast(): boolean {
    return this.index >= this.table.width - 1;
  }

  private getMaxDuties() {
    return Math.floor(24 / this.config.dutyDuration);
  }

  static daysFrom(table: ExtraDutyTable): readonly DayOfExtraDuty[] {
    const duties: DayOfExtraDuty[] = new Array(table.width);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new this(i, table);
    }

    return duties;
  }
}