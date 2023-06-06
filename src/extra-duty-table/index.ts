import { DaySearch } from './parsers';
import { DayOfExtraDuty } from './structs/day-of-extra-duty';
import { getMonth, getNumOfDaysInMonth, randomIntFromInterval } from './utils';
import { WorkerInfo } from './worker-info';

export interface ExtraDutyTableConfig {
  readonly firstDutyTime: number;
  readonly dutyInterval: number;
  readonly dutyDuration: number;
  readonly month: number;
  dutyMinDistance: number;
  dutyCapacity: number;
}

export interface ExtraDutyTableEntry {
  workerName: string;
  dutyStart: number;
  dutyEnd: number;
  day: number;
}

export class ExtraDutyTable implements Iterable<ExtraDutyTableEntry> {
  readonly config: ExtraDutyTableConfig;
  readonly width: number;
  readonly table: DayOfExtraDuty[];

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    this.config = ExtraDutyTable.createConfigFrom(config);

    this.width = getNumOfDaysInMonth(this.config.month);
    this.table = [];
  }

  *[Symbol.iterator](): Iterator<ExtraDutyTableEntry> {
    for (const day of this.table) {
      for (const duty of day) {
        for (const workerName of duty) {
          yield {
            day: duty.day,
            dutyStart: duty.start,
            dutyEnd: duty.end % 24,
            workerName,
          };
        }
      }
    }
  }

  toArray() {
    return Array.from(this);
  }

  getDay(day: number) {
    // if (day >= this.width) throw new Error(`Out of bounds error, limit: ${this.width}`)

    const dayOfExtraDuty = this.table.at(day);
    if (dayOfExtraDuty) return dayOfExtraDuty;

    const newDayOfExtraDuty = new DayOfExtraDuty(day, this);

    this.table[newDayOfExtraDuty.day] = newDayOfExtraDuty;

    return newDayOfExtraDuty;
  }

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

  assignArray(workers: WorkerInfo[]): boolean {
    let workersSet: Set<WorkerInfo> = new Set(workers);

    for (let i = 0; i < 20; i++) {
      for (const worker of workersSet) {
        const result = this.assign(worker);

        if (result) {
          worker.positionsLeft--;
        }

        if (worker.positionsLeft <= 0) {
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
      dutyMinDistance: 2,
      firstDutyTime: 1,
      dutyCapacity: 2,
      dutyInterval: 6,
      dutyDuration: 6,
      month: getMonth(),
      ...partialConfig,
    };
  }
}