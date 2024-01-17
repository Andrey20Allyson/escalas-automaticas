import clone from 'clone';
import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from '.';
import { firstMondayFromYearAndMonth, getNumOfDaysInMonth, thisMonth, thisYear } from '../../utils';
import { ExtraPlace } from './extra-place';

export interface ExtraDutyTableConfig {
  readonly dutyPositionSize: number;
  readonly firstDutyTime: number;
  readonly dutyInterval: number;
  readonly dutyDuration: number;
  readonly month: number;
  readonly year: number;
  dutyMinDistance: number;
  dutyCapacity: number;
  currentPlace: string;
}

export interface ExtraDutyTableEntry {
  worker: WorkerInfo;
  duty: ExtraDuty;
  day: DayOfExtraDuty;
}

export class ExtraDutyTable implements Iterable<DayOfExtraDuty> {
  readonly days: readonly DayOfExtraDuty[];
  readonly config: ExtraDutyTableConfig;
  readonly firstMonday: number;
  readonly width: number;

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    this.config = ExtraDutyTable.createConfigFrom(config);

    this.width = getNumOfDaysInMonth(this.config.month, this.config.year);
    this.days = DayOfExtraDuty.daysFrom(this);

    this.firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);
  }

  *iterDuties(): Iterable<ExtraDuty> {
    for (const day of this) {
      for (const duty of day) {
        yield duty;
      }
    }
  }

  copy(other: ExtraDutyTable) {
    for (const otherDuty of other.iterDuties()) {
      this
        .getDay(otherDuty.day.index)
        .getDuty(otherDuty.index)
        .copy(otherDuty);
    }

    return this;
  }

  clone(): ExtraDutyTable {
    return clone(this);
  }

  [Symbol.iterator](): Iterator<DayOfExtraDuty> {
    return this.days[Symbol.iterator]();
  }

  *entries(): Iterable<ExtraDutyTableEntry> {
    for (const day of this) {
      for (const duty of day) {
        for (const [_, worker] of duty) {
          yield { worker, duty, day };
        }
      }
    }
  }

  workers() {
    const workersSet = new Set<WorkerInfo>();

    for (const entry of this.entries()) {
      workersSet.add(entry.worker);
    }

    return Array.from(workersSet);
  }

  clear() {
    for (const day of this) {
      day.clear();
    }
  }

  toArray() {
    return Array.from(this);
  }

  getDay(day: number) {
    return this.days.at(day) ?? new DayOfExtraDuty(day, this);
  }

  static createConfigFrom(partialConfig?: Partial<ExtraDutyTableConfig>): ExtraDutyTableConfig {
    return {
      dutyPositionSize: partialConfig?.dutyPositionSize ?? 2,
      dutyMinDistance: partialConfig?.dutyMinDistance ?? 4,
      firstDutyTime: partialConfig?.firstDutyTime ?? 7,
      dutyInterval: partialConfig?.dutyInterval ?? 12,
      dutyDuration: partialConfig?.dutyDuration ?? 12,
      dutyCapacity: partialConfig?.dutyCapacity ?? 2,
      month: partialConfig?.month ?? thisMonth,
      year: partialConfig?.year ?? thisYear,
      currentPlace: partialConfig?.currentPlace ?? ExtraPlace.JIQUIA,
    };
  }
}