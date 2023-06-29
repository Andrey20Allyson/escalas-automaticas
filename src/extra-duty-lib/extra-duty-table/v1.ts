import { DaySearch } from '../structs';
import { DayOfExtraDuty } from '../structs/day-of-extra-duty';
import { getMonth, getNumOfDaysInMonth, randomIntFromInterval } from '../../utils';
import { WorkerInfo } from '../structs/worker-info';
import { ExtraDuty } from '../structs/extra-duty';

export interface ExtraDutyTableConfig {
  readonly dutyPositionSize: number;
  readonly firstDutyTime: number;
  readonly dutyInterval: number;
  readonly dutyDuration: number;
  readonly month: number;
  dutyMinDistance: number;
  dutyCapacity: number;
}

export interface ExtraDutyTableEntry {
  worker: WorkerInfo;
  duty: ExtraDuty;
  day: DayOfExtraDuty;
}

export class ExtraDutyTable implements Iterable<DayOfExtraDuty> {
  readonly days: readonly DayOfExtraDuty[];
  readonly config: ExtraDutyTableConfig;
  readonly width: number;

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    this.config = ExtraDutyTable.createConfigFrom(config);

    this.width = getNumOfDaysInMonth(this.config.month);
    this.days = DayOfExtraDuty.daysFrom(this);
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

  /**@deprecated */
  assign(worker: WorkerInfo) {
    const randDay = randomIntFromInterval(0, this.width - 1);

    const search = DaySearch.fromDay(randDay);

    while (true) {
      const dayOff = worker.daysOfWork.searchClosestDayOff(search);
      if (dayOff === undefined) break;

      const day = this.getDay(dayOff);

      for (let dutyIndex = 0; dutyIndex < day.size; dutyIndex++) {
        if (!day.insert(worker, dutyIndex)) continue;

        return true;
      }
    }

    return false;
  }

  /**@deprecated */
  tryAssignArray(workers: WorkerInfo[]): boolean {
    let workersSet: Set<WorkerInfo> = new Set(workers);

    for (let i = 0; i < 20; i++) {
      for (const worker of workersSet) {
        this.assign(worker);

        if (worker.isCompletelyBusy()) {
          workersSet.delete(worker);
          break;
        }
      }

      if (workersSet.size === 0) return true;
    }

    return false;
  }

  static createConfigFrom(partialConfig?: Partial<ExtraDutyTableConfig>): ExtraDutyTableConfig {
    return {
      dutyPositionSize: partialConfig?.dutyPositionSize ?? 2,
      dutyMinDistance: partialConfig?.dutyMinDistance ?? 1,
      firstDutyTime: partialConfig?.firstDutyTime ?? 7,
      dutyInterval: partialConfig?.dutyInterval ?? 12,
      dutyDuration: partialConfig?.dutyDuration ?? 12,
      dutyCapacity: partialConfig?.dutyCapacity ?? 2,
      month: partialConfig?.month ?? getMonth(),
    };
  }
}