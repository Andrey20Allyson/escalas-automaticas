import { iterRandom, iterWeekends, randomizeArray } from "../../../utils";
import { ExtraDutyTable } from "../../extra-duty-table";
import { isInsp, isSubInsp, workerIsCompletelyBusy, isMonday, isDailyWorker } from "../../extra-duty-table/utils";
import { WorkerInfo } from "../../structs";

export class JQScheduleAssigner {
  constructor(
    readonly table: ExtraDutyTable,
  ) { }

  assign(workers: WorkerInfo[]) {
    this._assignDailyWorkerArray(workers);
    this._assignInspArray(workers);
    this._assignSubInspArray(workers);
    this._assignArray(workers, 1, 2, true);
    this._assignArray(workers, 2, 3);

    return this.table;
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
    const oldDutyCapacity = this.table.config.dutyCapacity;

    for (let capacity = min; capacity <= max; capacity++) {
      this.table.config.dutyCapacity = capacity;

      for (const day of iterRandom(this.table)) {
        let filteredWorkers = workers.filter(workerIsCompletelyBusy);

        if (filteredWorkers.length === 0) break;

        const duties = isMonday(day.day, this.table.firstMonday) ? day : iterRandom(day);

        for (const duty of duties) {
          const passDuty = duty.isFull() || (excludeMondays && isMonday(duty.day, this.table.firstMonday));
          if (passDuty) continue;

          for (const worker of iterRandom(filteredWorkers)) {
            day.insert(worker, duty);

            if (duty.isFull()) break;
          }
        }
      }
    }

    this.table.config.dutyCapacity = oldDutyCapacity;
  }

  private _assignOnAllWeekEnds(worker: WorkerInfo): boolean {
    const oldDutyMinDistance = this.table.config.dutyMinDistance;
    const oldDutyCapacity = this.table.config.dutyCapacity;

    this.table.config.dutyMinDistance = 1;
    this.table.config.dutyCapacity = 3;

    const weekends = iterRandom(iterWeekends(this.table.firstMonday));

    for (const weekend of weekends) {
      if (weekend.saturday) {
        const day = this.table.getDay(weekend.saturday);

        day.fill(worker);
      }

      if (weekend.sunday) {
        this.table
          .getDay(weekend.sunday)
          .insert(worker, 0);
      }
    }

    this.table.config.dutyMinDistance = oldDutyMinDistance;
    this.table.config.dutyCapacity = oldDutyCapacity;

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