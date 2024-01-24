import { iterRandom, isMonday, iterWeekends, randomizeArray } from "../../../utils";
import { WorkerInfo, ExtraDutyTable, ExtraDuty } from "../../structs";
import { BaseScheduleAssigner } from "./base-assigner";

export class ScheduleAssignerV1 extends BaseScheduleAssigner {
  isDailyWorker = (worker: WorkerInfo) => worker.daysOfWork.isDailyWorker;
  isInsp = (worker: WorkerInfo) => worker.graduation === 'insp';
  isSubInsp = (worker: WorkerInfo) => worker.graduation === 'sub-insp';

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

  private _assignInspArray(table: ExtraDutyTable, workers: WorkerInfo[]): void {
    const inspWorkers = workers.filter(this.isInsp, true);

    this._assignArray(table, inspWorkers, 1, 1);
  }

  private _assignSubInspArray(table: ExtraDutyTable, workers: WorkerInfo[]): void {
    const subInspWorkers = workers.filter(this.isSubInsp);

    this._assignArray(table, subInspWorkers, 1, 2, true);
  }

  private _assignArray(table: ExtraDutyTable, workers: WorkerInfo[], min: number, max: number, excludeMondays = false): void {
    const oldDutyCapacity = table.config.dutyCapacity;

    for (let capacity = min; capacity <= max; capacity++) {
      table.config.dutyCapacity = capacity;

      for (const day of iterRandom(table)) {
        let filteredWorkers = workers.filter(worker => table.limiter.isLimitOut(worker));

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

  private _assignOnAllWeekEnds(table: ExtraDutyTable, worker: WorkerInfo): void {
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
  }

  private _assignDailyWorkerArray(table: ExtraDutyTable, workers: WorkerInfo[]): void {
    const dailyWorkers = randomizeArray(workers.filter(this.isDailyWorker), true);

    for (const worker of dailyWorkers) {
      this._assignOnAllWeekEnds(table, worker);
    }
  }
}