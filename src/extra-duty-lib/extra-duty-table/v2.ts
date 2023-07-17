import clone from "clone";
import { firstMondayFromYearAndMonth, forkArray, iterRandom, thisMonthWeekends } from "../../utils";
import { ExtraDuty } from "../structs";
import { Clonable, Graduation, WorkerInfo } from "../structs/worker-info";
import { ExtraDutyTable } from "./v1";

export function filterBusyWorkers(worker: WorkerInfo) {
  return !worker.isCompletelyBusy();
}

export function filterDiarists(worker: WorkerInfo) {
  return worker.daysOfWork.getNumOfDaysOff() <= 10
}

type PointGetter = (day: number, firstMonday: number) => number;

const isInsp = (worker: WorkerInfo) => worker.graduation === Graduation.INSP;
const isSubInsp = (worker: WorkerInfo) => worker.graduation === Graduation.SI;
const pointGetterMap: PointGetter[] = [
  (day, firstMonday) => -(isMonday(day, firstMonday) ? 1 : 20),
  () => -50,
];

function isMonday(day: number, firstMonday: number): boolean {
  return day % 7 === firstMonday
}

function calculateDutyPontuation(duty: ExtraDuty, firstMonday: number): number {
  const pointGetter = pointGetterMap.at(duty.getSize());
  const isNightDuty = duty.index > 0;

  return (pointGetter?.(duty.day, firstMonday) ?? 0) * (isNightDuty ? 2 : 1);
}

export class ExtraDutyTableV2 extends ExtraDutyTable implements Clonable<ExtraDutyTableV2> {
  tryAssignArrayMultipleTimes(workers: WorkerInfo[], times: number): boolean {
    let bestTable: ExtraDutyTableV2 | undefined;
    let bestPontuation = -Infinity;
    const firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);

    for (let i = 0; i < times; i++) {
      this.tryAssignArrayV2(workers);

      const points = this.calculatePontuation(firstMonday);

      if (points >= 0) {
        bestTable = this.clone();
        this.clear();

        break;
      }

      if (points > bestPontuation) {
        bestTable = this.clone();
        bestPontuation = points;
      }

      this.clear();
    }

    if (bestTable) {
      for (const day of bestTable) {
        const thisDay = this.getDay(day.day);

        for (const bestDuty of day) {
          const thisDuty = thisDay.getDuty(bestDuty.index);

          thisDuty.workers = bestDuty.workers;
        }
      }
    }

    return bestPontuation >= 0;
  }

  clone(): ExtraDutyTableV2 {
    return clone(this);
  }

  calculatePontuation(firstMonday: number) {
    let points = 0;
    const workerSet = new Set<WorkerInfo>()

    for (const day of this) {
      for (const duty of day) {
        let haveInspOrSub = false;
        
        for (const [_, worker] of duty.workers) {
          workerSet.add(worker);

          if (worker.graduation === Graduation.SI || worker.graduation === Graduation.INSP) {
            haveInspOrSub = true;
          }
        }

        points += haveInspOrSub ? 0 : -30;
        points += calculateDutyPontuation(duty, firstMonday);
      }
    }

    for (const worker of workerSet) {
      if (!worker.isCompletelyBusy()) {
        points += -100 * 1.4 * worker.positionsLeft ** 2;
      }
    }

    return points;
  }

  tryAssignArrayV2(workers: WorkerInfo[]) {
    const [
      diarists,
      periodics,
    ] = forkArray(workers, filterDiarists);

    this._assignDiaristArray(diarists);
    this._assignInspArray(periodics);
    this._assignSubInspArray(periodics);
    this._assignArray(periodics, 2, 2, true);
    this._assignArray(periodics, 2, 3);
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

    for (let i = min; i <= max; i++) {
      this.config.dutyCapacity = i;

      for (const day of iterRandom(this)) {
        let filteredWorkers = workers.filter(filterBusyWorkers);

        if (filteredWorkers.length === 0) break;

        for (const duty of iterRandom(day)) {
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
    this.config.dutyMinDistance = 1;

    for (const weekend of iterRandom(thisMonthWeekends)) {
      if (weekend.saturday) {
        const day = this.getDay(weekend.saturday);

        day.fill(worker);
      }

      if (weekend.sunday) {
        const day = this.getDay(weekend.sunday);

        day.fill(worker);
      }
    }

    this.config.dutyMinDistance = oldDutyMinDistance;

    return worker.isCompletelyBusy();
  }

  private _assignDiaristArray(workers: WorkerInfo[]): boolean {
    const workersSet = new Set(workers);

    for (const worker of workersSet) {
      this._assignOnAllWeekEnds(worker);

      if (worker.isCompletelyBusy()) workersSet.delete(worker);
    }

    return workersSet.size === 0;
  }
}