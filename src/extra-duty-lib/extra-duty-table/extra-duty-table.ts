import clone from 'clone';
import { firstMondayFromYearAndMonth, getNumOfDaysInMonth, iterRandom, iterWeekends, randomizeArray, thisMonth, thisYear } from '../../utils';
import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from '../structs';
import { DefaultTableIntegrityAnalyser, TableIntegrity, TableIntegrityAnalyser } from './integrity';
import { isDailyWorker, isInsp, isMonday, isSubInsp, workerIsCompletelyBusy } from './utils';
import { ExtraPlace } from './extra-place';

export interface ExtraDutyTableConfig {
  readonly maxAcceptablePenalityAcc: number;
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
  integrity: TableIntegrity;

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    this.config = ExtraDutyTable.createConfigFrom(config);

    this.width = getNumOfDaysInMonth(this.config.month, this.config.year);
    this.days = DayOfExtraDuty.daysFrom(this);

    this.firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);

    this.integrity = new TableIntegrity(this.config.maxAcceptablePenalityAcc);
  }

  *iterDuties(): Iterable<ExtraDuty> {
    for (const day of this) {
      for (const duty of day) {
        yield duty;
      }
    }
  }

  everyDutyHasMinQuatity() {
    return !this.hasWorkerInsuficientDuty();
  }

  hasWorkerInsuficientDuty() {
    for (const duty of this.iterDuties()) {
      if (duty.isWorkerInsuficient()) return true;
    }

    return false;
  }

  tryAssignArrayMultipleTimes(workers: WorkerInfo[], times: number): boolean {
    let bestClone = this._bestClone(workers, times);
    if (!bestClone) return false;

    this.copy(bestClone);

    return true;
  }

  copy(other: ExtraDutyTable) {
    for (const otherDuty of other.iterDuties()) {
      this
        .getDay(otherDuty.day)
        .getDuty(otherDuty.index)
        .copy(otherDuty);
    }

    this.integrity = other.integrity;

    return this;
  }

  private _bestClone(workers: WorkerInfo[], limit: number): ExtraDutyTable | null {
    let table = this.clone();
    let bestClone: ExtraDutyTable | null = null;

    for (let i = 0; i < limit; i++) {
      table.clear();
      table.tryAssignArrayV2(workers);
      table.analyse();

      if (table.integrity.isPerfect()) {
        return table;
      }

      if (table.isBetterThan(bestClone)) {
        bestClone = table.clone();
      }
    }

    return bestClone;
  }

  isBetterThan(otherTable: ExtraDutyTable | null): boolean {
    return otherTable === null || this.integrity.isBetterThan(otherTable.integrity);
  }

  empityClone(): ExtraDutyTable {
    const clone = this.clone();
    clone.clear();

    return clone;
  }

  analyse(analyser: TableIntegrityAnalyser = new DefaultTableIntegrityAnalyser()): TableIntegrity {
    return analyser.analyse(this, this.integrity);
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
    this.integrity.clear();

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

  private tryAssignArrayV2(workers: WorkerInfo[]) {
    this._assignDailyWorkerArray(workers);
    this._assignInspArray(workers);
    this._assignSubInspArray(workers);
    this._assignArray(workers, 1, 2, true);
    this._assignArray(workers, 2, 3);
  }

  private _assignInspArray(workers: WorkerInfo[]) {
    const inspWorkers = workers.filter(isInsp, true);

    this._assignArray(inspWorkers, 1, 1);
  }

  private _assignSubInspArray(workers: WorkerInfo[]) {
    const subInspWorkers = workers.filter(isSubInsp);

    this._assignArray(subInspWorkers, 1, 2, true);
  }

  private _assignArray(workers: WorkerInfo[], min: number, max: number, excludeMondays = false) {
    const oldDutyCapacity = this.config.dutyCapacity;

    for (let capacity = min; capacity <= max; capacity++) {
      this.config.dutyCapacity = capacity;

      for (const day of iterRandom(this)) {
        let filteredWorkers = workers.filter(workerIsCompletelyBusy);

        if (filteredWorkers.length === 0) break;

        const duties = isMonday(day.day, this.firstMonday) ? day : iterRandom(day);

        for (const duty of duties) {
          const passDuty = duty.isFull() || (excludeMondays && isMonday(duty.day, this.firstMonday));
          if (passDuty) continue;

          for (const worker of iterRandom(filteredWorkers)) {
            day.insert(worker, duty);

            if (duty.isFull()) break;
          }
        }
      }
    }

    this.config.dutyCapacity = oldDutyCapacity;
  }

  private _assignOnAllWeekEnds(worker: WorkerInfo): boolean {
    const oldDutyMinDistance = this.config.dutyMinDistance;
    const oldDutyCapacity = this.config.dutyCapacity;

    this.config.dutyMinDistance = 1;
    this.config.dutyCapacity = 3;

    const weekends = iterRandom(iterWeekends(this.firstMonday));

    for (const weekend of weekends) {
      if (weekend.saturday) {
        const day = this.getDay(weekend.saturday);

        day.fill(worker);
      }

      if (weekend.sunday) {
        this
          .getDay(weekend.sunday)
          .insert(worker, 0);
      }
    }

    this.config.dutyMinDistance = oldDutyMinDistance;
    this.config.dutyCapacity = oldDutyCapacity;

    return worker.isCompletelyBusy();
  }

  private _assignDailyWorkerArray(workers: WorkerInfo[]): boolean {
    const dailyWorkers = randomizeArray(workers.filter(isDailyWorker), true);

    let success = true;

    for (const worker of dailyWorkers) {
      let assignSuccess = this._assignOnAllWeekEnds(worker);

      if (success && !assignSuccess) {
        success = false;
      }
    }

    return success;
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
      maxAcceptablePenalityAcc: partialConfig?.maxAcceptablePenalityAcc ?? 100_000,
      currentPlace: partialConfig?.currentPlace ?? ExtraPlace.JIQUIA,
    };
  }
}