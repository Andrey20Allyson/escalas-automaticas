import clone from "clone";
import { iterRandom, iterWeekends, randomizeArray } from "../../utils";
import { ExtraDuty } from "../structs";
import { Clonable, WorkerInfo } from "../structs/worker-info";
import { DefaultTableIntegrityAnalyser, TableIntegrity, TableIntegrityAnalyser } from "./integrity";
import { isDailyWorker, isInsp, isMonday, isSubInsp, workerIsCompletelyBusy } from "./utils";
import { ExtraDutyTable, ExtraDutyTableConfig } from "./v1";

export interface ExtraDutyTableV2Config extends ExtraDutyTableConfig {
  readonly maxAcceptablePenalityAcc?: number;
}

export class ExtraDutyTableV2 extends ExtraDutyTable implements Clonable<ExtraDutyTableV2> {
  integrity: TableIntegrity;

  constructor(config?: Partial<ExtraDutyTableV2Config>) {
    super(config);

    this.integrity = new TableIntegrity(config?.maxAcceptablePenalityAcc ?? 100_000);
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

  clear() {
    this.integrity.clear();

    super.clear();
  }

  tryAssignArrayMultipleTimes(workers: WorkerInfo[], times: number): boolean {
    let bestClone = this._bestClone(workers, times);
    if (!bestClone) return false;

    this.copy(bestClone);

    return true;
  }

  copy(other: ExtraDutyTableV2) {
    for (const otherDuty of other.iterDuties()) {
      const duty = this
        .getDay(otherDuty.day)
        .getDuty(otherDuty.index);

      duty.workers = otherDuty.workers;
    }

    this.integrity = other.integrity;

    return this;
  }

  private _bestClone(workers: WorkerInfo[], limit: number): ExtraDutyTableV2 | null {
    const analyser = new DefaultTableIntegrityAnalyser();

    let table = this.clone();
    let bestClone: ExtraDutyTableV2 | null = null;

    for (let i = 0; i < limit; i++) {
      table.clear();
      table.tryAssignArrayV2(workers);
      table.analyse(analyser);

      if (table.integrity.isPerfect()) {
        return table;
      }

      if (table.isBetterThan(bestClone)) {
        bestClone = table.clone();
      }
    }

    return bestClone;
  }

  isBetterThan(otherTable: ExtraDutyTableV2 | null): boolean {
    return otherTable === null || this.integrity.isBetterThan(otherTable.integrity);
  }

  empityClone(): ExtraDutyTableV2 {
    const clone = this.clone();
    clone.clear();

    return clone;
  }

  analyse(analyser: TableIntegrityAnalyser = new DefaultTableIntegrityAnalyser()): TableIntegrity {
    return analyser.analyse(this, this.integrity);
  }

  clone(): ExtraDutyTableV2 {
    return clone(this);
  }

  tryAssignArrayV2(workers: WorkerInfo[]) {
    this._assignDailyWorkerArray(workers);
    this._assignInspArray(workers);
    this._assignSubInspArray(workers);
    this._assignArray(workers, 2, 2, true);
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
}