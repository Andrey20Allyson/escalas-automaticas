import { ExtraDutyTable } from ".";
import { forkArray, iterRandom, thisMonthWeekends } from "../utils";
import { WorkerInfo } from "./worker-info";

export function filterBusyWorkers(worker: WorkerInfo) {
  return !worker.isCompletelyBusy();
}

export function filterDiarists(worker: WorkerInfo) {
  return worker.daysOfWork.getNumOfDaysOff() <= 10
}

export class ExtraDutyTableV2 extends ExtraDutyTable {
  assignArray(workers: WorkerInfo[]): boolean {
    const [
      diarists,
      periodics,
    ] = forkArray(workers, filterDiarists);

    this.assignArrayToAllWeekEnds(diarists);

    const oldDutyCapacity = this.config.dutyCapacity;
    
    let assignSuccess = true;

    for (let i = 1; i <= 3; i++) {
      this.config.dutyCapacity = i;

      for (const day of iterRandom(this)) {
        let filteredWorkers = periodics.filter(filterBusyWorkers);

        for (const duty of iterRandom(day)) {
          let success = false;

          for (const worker of iterRandom(filteredWorkers)) {
            success = day.insert(worker, duty);

            if (success) break;
          }

          if (!success) assignSuccess = false
        }
      }
    }

    this.config.dutyCapacity = oldDutyCapacity;

    return assignSuccess;
  }

  assignOnAllWeekEnds(worker: WorkerInfo): boolean {
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

  assignArrayToAllWeekEnds(workers: WorkerInfo[]): boolean {
    const workersSet = new Set(workers);

    for (const worker of workersSet) {
      this.assignOnAllWeekEnds(worker);

      if (worker.isCompletelyBusy()) workersSet.delete(worker);
    }

    return workersSet.size === 0;
  }
}