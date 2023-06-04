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
    if (this.has(worker)) throw new Error(`Can't add a worker to same duty for the second time!`);

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
    readonly index: number,
    readonly dutyTable: ExtraDutyTable,
  ) {
    this.duties = [];
  }

  getGaxDuties() {
    return Math.floor(24 / this.config.dutyInterval);
  }

  getDuty(dutyIndex: number): ExtraDuty {
    const maxDuties = this.getGaxDuties();

    if (dutyIndex < 0) {
      const dayOfExtraDuty = this.dutyTable.getDayOfExtraDuty(this.index + Math.floor(dutyIndex / maxDuties));

      if (dutyIndex + maxDuties < 0) throw new Error(`Out of bounds error, limit: ${maxDuties}, index: ${dutyIndex}`);

      return dayOfExtraDuty.getDuty(maxDuties + dutyIndex);
    }

    if (dutyIndex >= maxDuties) {
      const dayOfExtraDuty = this.dutyTable.getDayOfExtraDuty(this.index + Math.ceil((dutyIndex - maxDuties + 1) / maxDuties));
      
      if (dutyIndex - maxDuties >= maxDuties) throw new Error(`Out of bounds error, limit: ${maxDuties}, index: ${dutyIndex}`);

      return dayOfExtraDuty.getDuty(dutyIndex - maxDuties);
    } 

    const duty = this.duties.at(dutyIndex);
    if (duty) return duty;

    const newDuty = new ExtraDuty();

    this.duties[dutyIndex] = newDuty;

    return newDuty;
  }

  workedAtInterval(worker: WorkerInfo, start: number, end: number) {
    for (let i = start; i < end; i++) {
      if (this.getDuty(i).has(worker)) return true;
    }

    return false
  }

  insert(worker: WorkerInfo, dutyIndex: number, distance: number = 0): boolean {
    if (distance < 0) throw new Error(`Distance can't be smaller than 0! distance: ${distance}`);

    const workedInDutyAfterOrNowOrBefore = this.workedAtInterval(worker, dutyIndex - 1 - distance, dutyIndex + 2 + distance);
    if (workedInDutyAfterOrNowOrBefore) return false;

    const duty = this.getDuty(dutyIndex);
    if (duty.reachedTheLimit()) return false;

    const workedYesterday = worker.daysOfWork.workOn(this.index - 1);

    if (!workedYesterday) {
      duty.add(worker);
      return true;
    }

    const offTimeEnd = (worker.workTime.startTime + worker.workTime.totalTime * 2) % 24;
    const dutyStart = (this.config.firstDutyTime + this.config.dutyInterval * dutyIndex) % 24;

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

export interface WorkerSetEntry {
  readonly worker: WorkerInfo;
  dutiesLeft: number;
}

export function workerSetEntryFactory(worker: WorkerInfo): WorkerSetEntry {
  return { worker, dutiesLeft: 10 }
}

export class ExtraDutyTable implements Iterable<ExtraDutyTableEntry> {
  readonly dayOfExtraDutyConfig: DayOfExtraDutyConfig;
  readonly width: number;
  readonly table: DayOfExtraDuty[];

  constructor(month = getMonth()) {
    this.dayOfExtraDutyConfig = {
      firstDutyTime: 1,
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

  toArray() {
    return Array.from(this);
  }

  getDayOfExtraDuty(day: number) {
    // if (day >= this.width) throw new Error(`Out of bounds error, limit: ${this.width}`)

    const dayOfExtraDuty = this.table.at(day);
    if (dayOfExtraDuty) return dayOfExtraDuty;

    const newDayOfExtraDuty = new DayOfExtraDuty(day, this);

    this.table[newDayOfExtraDuty.index] = newDayOfExtraDuty;

    return newDayOfExtraDuty;
  }

  assign(worker: WorkerInfo, distance = 0) {
    const randDay = randomIntFromInterval(0, this.width - 1);

    const search = DaySearch.fromDay(randDay);

    while (true) {
      const dayOff = worker.daysOfWork.searchClosestDayOff(search);
      if (dayOff === undefined) break;

      const dayOfExtraDuty = this.getDayOfExtraDuty(dayOff);

      for (let dutyIndex = 0; dutyIndex < this.dayOfExtraDutyConfig.maxDuties; dutyIndex++) {
        if (!dayOfExtraDuty.insert(worker, dutyIndex, distance)) continue;

        return true;
      }
    }

    return false;
  }

  assignArray(workers: WorkerInfo[]): boolean {
    let workersSet: Set<WorkerSetEntry> = new Set(workers.map(workerSetEntryFactory));

    for (let i = 0; i < 20; i++) {
      for (const entry of workersSet) {
        const result = this.assign(entry.worker, 1);

        if (result) {
          entry.dutiesLeft--;
        }

        if (entry.dutiesLeft <= 0) {
          workersSet.delete(entry);
          break;
        }
      }

      if (workersSet.size === 0) return true;
    }

    // for (const entry of workersSet) {
    //   console.log(entry);
    // }

    return false;
  }
}