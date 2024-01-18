import { iterRandom, iterWeekends, randomizeArray } from "../../../utils";
import { ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../structs";
import { AssignmentRule } from "./checking";
import { isDailyWorker, isInsp, isMonday, isSubInsp, workerIsCompletelyBusy } from "./utils";

export class ScheduleAssigner {
  constructor(readonly checker: AssignmentRule) { }

  assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    this._assignDailyWorkerArray(table, workers);
    this._assignInspArray(table, workers);
    this._assignSubInspArray(table, workers);
    this._assignArray(table, workers, 1, 2, true);
    this._assignArray(table, workers, 2, 3);

    return table;
  }

  assignWorker(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.checker.canAssign(worker, duty)) {
      duty.add(worker);

      return true;
    }

    return false;
  }

  private _assignInspArray(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const inspWorkers = workers.filter(isInsp, true);

    this._assignArray(table, inspWorkers, 1, 1);
  }

  private _assignSubInspArray(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const subInspWorkers = workers.filter(isSubInsp);

    this._assignArray(table, subInspWorkers, 1, 2, true);
  }

  private _assignArray(table: ExtraDutyTable, workers: WorkerInfo[], min: number, max: number, excludeMondays = false) {
    const oldDutyCapacity = table.config.dutyCapacity;

    for (let capacity = min; capacity <= max; capacity++) {
      table.config.dutyCapacity = capacity;

      for (const day of iterRandom(table)) {
        let filteredWorkers = workers.filter(workerIsCompletelyBusy);

        if (filteredWorkers.length === 0) break;

        const duties = isMonday(day.index, table.firstMonday) ? day : iterRandom(day);

        for (const duty of duties) {
          const passDuty = duty.isFull() || (excludeMondays && isMonday(duty.day.index, table.firstMonday));
          if (passDuty) continue;

          for (const worker of iterRandom(filteredWorkers)) {
            this.assignWorker(worker, duty);

            if (duty.isFull()) break;
          }
        }
      }
    }

    table.config.dutyCapacity = oldDutyCapacity;
  }

  private _assignOnAllWeekEnds(table: ExtraDutyTable, worker: WorkerInfo): boolean {
    const oldDutyMinDistance = table.config.dutyMinDistance;
    const oldDutyCapacity = table.config.dutyCapacity;

    table.config.dutyMinDistance = 1;
    table.config.dutyCapacity = 3;

    const weekends = iterRandom(iterWeekends(table.firstMonday));

    for (const weekend of weekends) {
      if (weekend.saturday) {
        const day = table.getDay(weekend.saturday);

        for (const duty of day) {
          this.assignWorker(worker, duty);
        }
      }

      if (weekend.sunday) {
        const duty = table
          .getDay(weekend.sunday)
          .getDuty(0);

        this.assignWorker(worker, duty);
      }
    }

    table.config.dutyMinDistance = oldDutyMinDistance;
    table.config.dutyCapacity = oldDutyCapacity;

    return worker.isCompletelyBusy();
  }

  private _assignDailyWorkerArray(table: ExtraDutyTable, workers: WorkerInfo[]): boolean {
    const dailyWorkers = randomizeArray(workers.filter(isDailyWorker), true);

    let success = true;

    for (const worker of dailyWorkers) {
      let assignSuccess = this._assignOnAllWeekEnds(table, worker);

      if (success && !assignSuccess) {
        success = false;
      }
    }

    return success;
  }
}