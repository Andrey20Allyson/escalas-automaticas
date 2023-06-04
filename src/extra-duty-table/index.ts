import { DaySearch } from './parsers';
import { getMonth, getNumOfDaysInMonth, randomIntFromInterval } from './utils';
import { WorkerInfo } from './worker-info';

export class ExtraDuty implements Iterable<string> {
  readonly workers: Set<string>;

  constructor() {
    this.workers = new Set();
  }

  [Symbol.iterator](): Iterator<string> {
    return this.workers[Symbol.iterator]();
  }

  reachedTheLimit() {
    return this.workers.size >= 3;
  }

  has(worker: WorkerInfo) {
    return this.workers.has(worker.workerName);
  }

  add(worker: WorkerInfo) {
    this.workers.add(worker.workerName);
  }
}

export interface DayOfExtraDutyConfig {
  readonly firstDutyTime: number;
  readonly dutyInterval: number;
  readonly maxDuties: number;
}

export class DayOfExtraDuty {
  readonly duties: ExtraDuty[];

  get config() {
    return this.dutyTable.dayOfExtraDutyConfig;
  }

  constructor(
    readonly dutyTable: ExtraDutyTable,
  ) {
    this.duties = [];
  }

  getDuty(dutyIndex: number) {
    if (dutyIndex >= this.config.maxDuties) throw new Error(`Out of bounds error, limit: ${this.config.maxDuties}`);

    const duty = this.duties.at(dutyIndex);
    if (duty) return duty;

    const newDuty = new ExtraDuty();

    this.duties[dutyIndex] = newDuty;

    return newDuty;
  }

  insert(worker: WorkerInfo, day: number, dutyIndex: number): boolean {
    if (dutyIndex > 0) {
      const pastDuty = this.getDuty(dutyIndex - 1);

      if (pastDuty.has(worker)) return false;
    }

    const duty = this.getDuty(dutyIndex);

    if (duty.has(worker)) return false;
    if (duty.reachedTheLimit()) return false;

    const workedYesterday = worker.daysOfWork.workOn(day - 1);

    if (!workedYesterday) {
      duty.add(worker);
      return true;
    }

    const offTimeEnd = (worker.workTime.startTime + worker.workTime.totalTime * 2) % 24;
    const dutyStart = (this.config.firstDutyTime + this.config.dutyInterval * dutyIndex) % 24;

    if (dutyStart)

    if (offTimeEnd > dutyStart) return false;

    duty.add(worker);

    return true;
  }
}

export interface ExtraDutyTableEntry {
  workerName: string;
  day: number;
  dutyStart: number;
  dutyEnd: number;
}

export class ExtraDutyTable implements Iterable<ExtraDutyTableEntry> {
  readonly dayOfExtraDutyConfig: DayOfExtraDutyConfig;
  readonly width: number;
  readonly table: DayOfExtraDuty[];

  constructor(month = getMonth()) {
    this.dayOfExtraDutyConfig = {
      firstDutyTime: 7,
      dutyInterval: 6,
      maxDuties: 4,
    };

    this.width = getNumOfDaysInMonth(month);
    this.table = [];
  }

  *[Symbol.iterator](): Iterator<ExtraDutyTableEntry> {
    const { dutyInterval, firstDutyTime, maxDuties } = this.dayOfExtraDutyConfig;

    for (let i = 0; i < this.width; i++) {
      const day = this.getDayOfExtraDuty(i);

      for (let j = 0; j < maxDuties; j++) {
        const duty = day.getDuty(j);

        for (const workerName of duty) {
          const dutyStart = (firstDutyTime + dutyInterval * j) % 24;

          yield {
            day: i + 1,
            dutyStart,
            dutyEnd: (dutyStart + dutyInterval) % 24,
            workerName,
          };
        }
      }
    }
  }

  getDayOfExtraDuty(day: number) {
    if (day >= this.width) throw new Error(`Out of bounds error, limit: ${this.width}`)

    const dayOfExtraDuty = this.table.at(day);
    if (dayOfExtraDuty) return dayOfExtraDuty;

    const newDayOfExtraDuty = new DayOfExtraDuty(this);

    this.table[day] = newDayOfExtraDuty;

    return newDayOfExtraDuty;
  }

  assign(worker: WorkerInfo) {
    const randDay = randomIntFromInterval(0, this.width - 1);
    
    const search = DaySearch.fromDay(randDay);

    while (true) {
      const dayOff = worker.daysOfWork.searchClosestDayOff(search);
      if (dayOff === undefined) break;
  
      const dayOfExtraDuty = this.getDayOfExtraDuty(dayOff);
  
      for (let dutyIndex = 0; dutyIndex < this.dayOfExtraDutyConfig.maxDuties; dutyIndex++) {
        if (!dayOfExtraDuty.insert(worker, dayOff, dutyIndex)) continue;
  
        return true;
      }
    }

    console.warn(`Has't possible insert worker ${worker.workerName}!`);
    return false;
  }
}