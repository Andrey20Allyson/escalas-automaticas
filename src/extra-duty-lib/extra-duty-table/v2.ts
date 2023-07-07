import { ExtraDutyTable } from "./v1";
import { DaysOfWeek, dayOfWeekFrom, firstMondayFromYearAndMonth, forkArray, isBusinessDay, iterRandom, thisMonthWeekends } from "../../utils";
import { Clonable, WorkerInfo } from "../structs/worker-info";
import clone from "clone";
import { ExtraDuty } from "../structs";

export function filterBusyWorkers(worker: WorkerInfo) {
  return !worker.isCompletelyBusy();
}

export function filterDiarists(worker: WorkerInfo) {
  return worker.daysOfWork.getNumOfDaysOff() <= 10
}

type PointGetter = (day: number, firstMonday: number) => number;

const pointGetterMap: PointGetter[] = [
  (day, firstMonday) => -(isMonday(day, firstMonday) ? 1 : 2),
  () => -100,
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
        for (const bestDuty of day) {
          const thisDuty = this.getDay(day.day).getDuty(bestDuty.index);

          thisDuty.workers = bestDuty.workers;
        }
      }
    }

    return bestPontuation >= 0;
  }

  clone(): ExtraDutyTableV2 {
    return clone(this);
  }

  tryAssignArrayV2(workers: WorkerInfo[]) {
    const [
      diarists,
      periodics,
    ] = forkArray(workers, filterDiarists);

    this.tryAssignArrayToAllWeekEnds(diarists);

    const oldDutyCapacity = this.config.dutyCapacity;

    for (let i = 2; i <= 3; i++) {
      this.config.dutyCapacity = i;

      for (const day of iterRandom(this)) {
        let filteredWorkers = periodics.filter(filterBusyWorkers);

        // for (const duty of iterRandom(day)) {
        for (let i = day.size - 1; i >= 0; i--) {
          const duty = day.getDuty(i);

          const passDuty = duty.isFull();
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

  calculatePontuation(firstMonday: number) {
    let points = 0;

    for (const day of this) {
      for (const duty of day) {
        points += calculateDutyPontuation(duty, firstMonday);
      }
    }

    return points;
  }

  tryAssignOnAllWeekEnds(worker: WorkerInfo): boolean {
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

  tryAssignArrayToAllWeekEnds(workers: WorkerInfo[]): boolean {
    const workersSet = new Set(workers);

    for (const worker of workersSet) {
      this.tryAssignOnAllWeekEnds(worker);

      if (worker.isCompletelyBusy()) workersSet.delete(worker);
    }

    return workersSet.size === 0;
  }
}