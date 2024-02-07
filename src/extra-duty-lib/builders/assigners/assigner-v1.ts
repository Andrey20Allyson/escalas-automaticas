import { DayOfWeek, isMonday, iterRandom, randomizeArray } from "../../../utils";
import { DayOfExtraDuty, ExtraDutyArray, ExtraDutyTable, ExtraEventName, WorkerInfo } from "../../structs";
import { AssignmentRule, AssignmentRuleStack } from "../rule-checking";
import { BusyWorkerAssignmentRule } from "../rule-checking/rules";
import { BaseScheduleAssigner } from "./base-assigner";

export interface AssingOptions {
  passDayWhen?: (day: DayOfExtraDuty) => boolean;
  passDutyPairWhen?: (duties: ExtraDutyArray) => boolean;
  /**
   * @default true
   */
  inPairs?: boolean;
  min: number;
  /**
   * @default AssingOptions.min
   */
  max?: number;
}

export class ScheduleAssignerV1 extends BaseScheduleAssigner {
  private _busyWorkerRule: BusyWorkerAssignmentRule | null;

  isDailyWorker = (worker: WorkerInfo) => worker.daysOfWork.isDailyWorker;
  isInsp = (worker: WorkerInfo) => worker.graduation === 'insp';
  isSubInsp = (worker: WorkerInfo) => worker.graduation === 'sub-insp';
  dayIsMonday = (day: DayOfExtraDuty) => day.isWeekDay(DayOfWeek.MONDAY);

  constructor(checker: AssignmentRule) {
    super(checker);

    this._busyWorkerRule = AssignmentRuleStack.find(this.checker, rule => rule instanceof BusyWorkerAssignmentRule);
  }

  assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    // if (table.config.currentPlace === ExtraPlace.JARDIM_BOTANICO) {
    //   const nightAllowedJBWorkers = workers.filter(worker => table.config.allowedIdsAtJBNight.includes(worker.id));

    //   this._assignArray(table, nightAllowedJBWorkers, {
    //     min: 1,
    //     max: 2,
    //     passDutyPairWhen: pair => pair.at(0)?.isDaytime() === true
    //   });
    // }

    this._assignDailyWorkerArray(table, workers);
    this._assignArray(table, workers.filter(this.isDailyWorker), { min: 2, inPairs: false });
    this._assignInspArray(table, workers);
    this._assignSubInspArray(table, workers);
    this._assignArray(table, workers, {
      passDayWhen: this.dayIsMonday,
      min: 1,
      max: 2,
    });
    this._assignArray(table, workers, { min: 2, max: 3 });
    this._assignArray(table, workers, { min: 2, max: 3, inPairs: false });

    return table;
  }

  private _isWorkerFree(worker: WorkerInfo, table: ExtraDutyTable): boolean {
    if (this._busyWorkerRule === null) return true;

    return this._busyWorkerRule.canAssign(worker, table);
  }

  private _assignInspArray(table: ExtraDutyTable, workers: WorkerInfo[]): void {
    const inspWorkers = workers.filter(this.isInsp, true);

    this._assignArray(table, inspWorkers, { min: 1 });
  }

  private _assignSubInspArray(table: ExtraDutyTable, workers: WorkerInfo[]): void {
    const subInspWorkers = workers.filter(this.isSubInsp);

    this._assignArray(table, subInspWorkers, {
      passDayWhen: this.dayIsMonday,
      min: 1,
      max: 2,
    });
  }

  private _assignInPair(day: DayOfExtraDuty, workers: WorkerInfo[], config: AssingOptions) {
    const pair = isMonday(day.index, day.table.month.getFirstMonday())
      ? day.pair()
      : iterRandom(day.pair());

    for (const duties of pair) {
      const passDuty = duties.someIsFull() || config.passDutyPairWhen?.(duties) === true;
      if (passDuty) continue;

      for (const worker of iterRandom(workers)) {
        this.assignWorker(worker, duties);

        if (duties.someIsFull()) break;
      }
    }
  }

  private _assignInDay(day: DayOfExtraDuty, workers: WorkerInfo[]) {
    for (const duty of iterRandom(day)) {
      if (duty.isFull()) continue;

      for (const worker of iterRandom(workers)) {
        this.assignWorker(worker, duty);

        if (duty.isFull()) break;
      }
    }
  }

  private _assignArray(table: ExtraDutyTable, workers: WorkerInfo[], options: AssingOptions): void {
    const {
      inPairs = true,
      min,
      max = min,
    } = options;
    const oldDutyCapacity = table.config.dutyCapacity;

    for (let capacity = min; capacity <= max; capacity++) {
      table.config.dutyCapacity = capacity;

      for (const day of iterRandom(table)) {
        let filteredWorkers = workers.filter(worker => this._isWorkerFree(worker, table));
        if (filteredWorkers.length === 0) break;

        if (options.passDayWhen?.(day) === true) {
          continue;
        }

        if (inPairs) {
          this._assignInPair(day, filteredWorkers, options);

          continue;
        }

        this._assignInDay(day, filteredWorkers);
      }
    }

    table.config.dutyCapacity = oldDutyCapacity;
  }

  private _assignOnAllWeekEnds(table: ExtraDutyTable, worker: WorkerInfo): void {
    const oldDutyMinDistance = table.config.dutyMinDistance;
    const oldDutyCapacity = table.config.dutyCapacity;

    table.config.dutyMinDistance = 1;
    table.config.dutyCapacity = 3;

    const weekends = iterRandom(table.month.iterWeekends());

    for (const weekend of weekends) {
      if (weekend.saturday) {
        const day = table.getDay(weekend.saturday);

        for (const duties of day.pair()) {
          this.assignWorker(worker, duties);
        }
      }

      if (weekend.sunday) {
        const duties = table
          .getDay(weekend.sunday)
          .pair()
          .daytime();

        this.assignWorker(worker, duties);
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