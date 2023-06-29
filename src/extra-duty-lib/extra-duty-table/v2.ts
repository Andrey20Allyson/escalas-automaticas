import { ExtraDutyTable } from "./v1";
import { forkArray, iterRandom, thisMonthWeekends } from "../../utils";
import { WorkerInfo } from "../structs/worker-info";

export function filterBusyWorkers(worker: WorkerInfo) {
  return !worker.isCompletelyBusy();
}

export function filterDiarists(worker: WorkerInfo) {
  return worker.daysOfWork.getNumOfDaysOff() <= 10
}

export class ExtraDutyTableV2 extends ExtraDutyTable {
  tryAssignArrayMultipleTimes(workers: WorkerInfo[], times: number): boolean {
    for (let i = 0; i < times; i++) {
      if (this.tryAssignArray(workers)) return true;
    }

    return false;
  }

  tryAssignArray(workers: WorkerInfo[]): boolean {
    const [
      diarists,
      periodics,
    ] = forkArray(workers, filterDiarists);

    const diaristsResult = this.tryAssignArrayToAllWeekEnds(diarists);

    if (!diaristsResult) {
      this.clear();

      return false;
    }

    const oldDutyCapacity = this.config.dutyCapacity;

    for (let i = 1; i <= 3; i++) {
      this.config.dutyCapacity = i;

      for (const day of iterRandom(this)) {
        let filteredWorkers = periodics.filter(filterBusyWorkers);

        for (const duty of iterRandom(day)) {
          if (duty.isFull()) continue;

          for (const worker of iterRandom(filteredWorkers)) {
            if (day.insert(worker, duty)) break;
          }

          if (i < 3 && !duty.isFull()) {
            this.clear();

            return false;
          }
        }
      }
    }

    this.config.dutyCapacity = oldDutyCapacity;

    return true;
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