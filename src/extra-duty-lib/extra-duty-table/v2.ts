import clone from "clone";
import { firstMondayFromYearAndMonth, iterRandom, iterWeekends, randomizeArray } from "../../utils";
import { Clonable, WorkerInfo } from "../structs/worker-info";
import { calculateDutyPontuation, isDailyWorker, isInsp, isMonday, isSubInsp, workerIsCompletelyBusy } from "./utils";
import { ExtraDutyTable, ExtraDutyTableConfig } from "./v1";
import { ExtraDuty } from "../structs";

export class ExtraDutyTableV2 extends ExtraDutyTable implements Clonable<ExtraDutyTableV2> {
  private _pontuation: number | null;

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    super(config);

    this._pontuation = null;
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

  /**
   * @throws If pontuation hasn't calculated yet
   */
  getPontuation() {
    if (this._pontuation === null) throw new Error(`Pontuation hasn't calculated yet!`);

    return this._pontuation;
  }

  clear() {
    this.resetPontuation()

    super.clear();
  }

  tryAssignArrayMultipleTimes(workers: WorkerInfo[], times: number): boolean {
    let bestTable: ExtraDutyTableV2 | undefined;
    const firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);

    for (let i = 0; i < times; i++) {
      this.tryAssignArrayV2(workers);

      this.calculatePontuation(firstMonday);
      const bestPontuation = bestTable?.getPontuation() ?? -Infinity;

      if (this.getPontuation() >= 0) {
        bestTable = this.clone();
        this.clear();

        break;
      }

      if (this.getPontuation() > bestPontuation) {
        bestTable = this.clone();
      }

      this.clear();
    }

    if (!bestTable) return false;

    for (const day of bestTable) {
      const thisDay = this.getDay(day.day);

      for (const bestDuty of day) {
        const thisDuty = thisDay.getDuty(bestDuty.index);

        thisDuty.workers = bestDuty.workers;
      }
    }

    return bestTable.getPontuation() >= 0;
  }

  clone(): ExtraDutyTableV2 {
    return clone(this);
  }

  calculatePontuation(firstMonday: number) {
    let points = 0;
    const workerSet = new Set<WorkerInfo>()
    let numOfGraduatePair = 0;
    let allDutiesHasGraduate = true;

    for (const day of this) {
      for (const duty of day) {
        let haveGraduate = false;
        let numOfGraduate = 0;

        for (const [_, worker] of duty.workers) {
          workerSet.add(worker);

          if (worker.graduation === 'sub-insp' || worker.graduation === 'insp') {
            haveGraduate = true;
            numOfGraduate++;
          }
        }

        if (!haveGraduate) allDutiesHasGraduate = false;

        if (numOfGraduate >= 2) numOfGraduatePair++;

        const isFemaleOnly = duty.getSize() > 0 && duty.genderQuantity('female') === duty.getSize();
        if (isFemaleOnly) {
          points -= 50000;
        }

        points += calculateDutyPontuation(duty, firstMonday);
      }
    }

    if (!allDutiesHasGraduate) {
      points -= numOfGraduatePair * 5000;
    }

    for (const worker of workerSet) {
      if (!worker.isCompletelyBusy() && worker.daysOfWork.getNumOfDaysOff() > 0) {
        points += -100 * 1.4 * worker.positionsLeft ** 2;
      }
    }

    this._pontuation = points;
  }

  resetPontuation() {
    this._pontuation = null;
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
    this.resetPontuation();

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

    this.resetPontuation();

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