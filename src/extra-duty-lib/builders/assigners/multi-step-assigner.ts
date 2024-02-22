import { DayOfWeek, isMonday, iterRandom, random, removeFromArrayWhere } from "../../../utils";
import {
  DayOfExtraDuty,
  ExtraDuty,
  ExtraDutyArray,
  ExtraDutyTable,
  ExtraEventName,
  WorkerInfo
} from "../../structs";
import { AssignmentRule, AssignmentRuleStack } from "../rule-checking";
import {
  BusyWorkerAssignmentRule,
  DutyLimitAssignmentRule,
  FemaleAssignmentRule,
  InspAssignmentRule,
  LicenseAssignmentRule,
  OrdinaryAssignmentRule,
  TimeOffAssignmentRule,
} from "../rule-checking/rules";
import { ExtraEventAllowedTimeRule } from "../rule-checking/rules/extra-event-allowed-time-rule";
import { ExtraEventAllowedWeekdaysRule } from "../rule-checking/rules/extra-event-allowed-weekdays-rule";
import { ExtraEventStartDayRule } from "../rule-checking/rules/extra-event-start-day";
import { BaseScheduleAssigner } from "./base-assigner";

export interface AssingOptions {
  /**
   * Filter the allowed workers for the assignment
   * @param worker 
   * @returns The permition to assign the worker
   */
  readonly onlyWorkersWhere?: (worker: WorkerInfo) => boolean;
  readonly passDayWhen?: (day: DayOfExtraDuty) => boolean;
  readonly passDutyPairWhen?: (duties: ExtraDutyArray) => boolean;
  readonly passDutyWhen?: (duty: ExtraDuty) => boolean;
  /**
   * @default ExtraDutyTable.config.currentEvent
   */
  readonly events?: string | string[];
  /**
   * @default true
   */
  readonly inPairs?: boolean;
  /**
   * The minimun of workers per duty 
   * @default 1
   */
  readonly min?: number;
  /**
   * The maximun of workers per duty
   * @default AssingOptions.min
   */
  readonly max?: number;
  readonly dutyMinDistance?: number;
}

export class MultiStepScheduleAssigner extends BaseScheduleAssigner {
  private _busyWorkerRule: BusyWorkerAssignmentRule | null;

  constructor(
    checker: AssignmentRule,
    readonly steps: ReadonlyArray<AssingOptions> = [],
    readonly defaultOptions: AssingOptions | null = null,
    busyWorkerRule?: BusyWorkerAssignmentRule | null,
  ) {
    super(checker);

    this._busyWorkerRule = busyWorkerRule ?? AssignmentRuleStack.find(this.checker, rule => rule instanceof BusyWorkerAssignmentRule);
  }

  useStep(...options: AssingOptions[]): MultiStepScheduleAssigner {
    return new MultiStepScheduleAssigner(
      this.checker,
      this.steps.concat(options),
      this.defaultOptions,
      this._busyWorkerRule,
    );
  }

  useDefault(options: AssingOptions): MultiStepScheduleAssigner {
    return new MultiStepScheduleAssigner(
      this.checker,
      this.steps,
      options,
      this._busyWorkerRule,
    );
  }

  removeDefault(): MultiStepScheduleAssigner {
    return new MultiStepScheduleAssigner(
      this.checker,
      this.steps,
      null,
      this._busyWorkerRule,
    );
  }

  assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    for (const step of this.steps) {
      this.assignArray(table, workers, step);
    }

    return table;
  }

  private _isWorkerFree(worker: WorkerInfo, table: ExtraDutyTable): boolean {
    if (this._busyWorkerRule === null) return true;

    return this._busyWorkerRule.canAssign(worker, table);
  }

  private _assignInPair(day: DayOfExtraDuty, workers: WorkerInfo[], options: AssingOptions) {
    const pair = isMonday(day.index, day.table.month.getFirstMonday())
      ? day.pair()
      : iterRandom(day.pair());

    for (const duties of pair) {
      const passDuty = duties.someIsFull() || options.passDutyPairWhen?.(duties) === true;
      if (passDuty) continue;

      for (const worker of iterRandom(workers)) {
        this.assignWorker(worker, duties);

        if (duties.someIsFull()) break;
      }
    }
  }

  private _assignInDay(day: DayOfExtraDuty, workers: WorkerInfo[], options: AssingOptions) {
    for (const duty of iterRandom(day)) {
      const passDuty = duty.isFull() || options.passDutyWhen?.(duty) === true;

      if (passDuty) continue;

      for (const worker of iterRandom(workers)) {
        this.assignWorker(worker, duty);

        if (duty.isFull()) break;
      }
    }
  }

  private _assignInDays(days: DayOfExtraDuty[], workers: WorkerInfo[], options: AssingOptions) {
    const { inPairs = true } = options;

    for (const day of days) {
      removeFromArrayWhere(workers, worker => this._isWorkerFree(worker, day.table) === false);
      if (workers.length === 0) break;

      if (options.passDayWhen?.(day) === true) {
        continue;
      }

      if (inPairs) {
        this._assignInPair(day, workers, options);
        continue;
      }

      this._assignInDay(day, workers, options);
    }
  }

  assignArray(table: ExtraDutyTable, workers: WorkerInfo[], options: AssingOptions): void {
    const {
      min = 1,
      max = min,
      events: _events = [table.config.currentPlace],
    } = options;

    const events = typeof _events === 'string' ? [_events] : _events;

    table.saveConfig();

    if (options.dutyMinDistance !== undefined) table.setDutyMinDistance(options.dutyMinDistance);

    const filteredWorkers = options.onlyWorkersWhere
      ? workers.filter(options.onlyWorkersWhere)
      : workers;

    let days = Array.from(table);

    const workersForEachEvent = events.reduce((rec, eventName) => {
      rec[eventName] = Array
        .from(filteredWorkers);

      return rec;
    }, {} as Record<string, WorkerInfo[]>);

    for (let capacity = min; capacity <= max; capacity++) {
      table.setDutyCapacity(capacity);

      for (const eventName of events) {
        table.setCurrentEvent(eventName);

        random.array(days, true);

        this._assignInDays(
          days,
          workersForEachEvent[eventName],
          options,
        );
      }
    }

    table.restoreConfig();
  }

  static default(): MultiStepScheduleAssigner {
    return new MultiStepScheduleAssigner(
      MultiStepScheduleAssigner.defaultChecker(),
      MultiStepScheduleAssigner.defaultSteps(),
    );
  }

  static defaultChecker(): AssignmentRuleStack {
    return new AssignmentRuleStack([
      new BusyWorkerAssignmentRule(),
      new DutyLimitAssignmentRule(),
      new FemaleAssignmentRule(),
      new ExtraEventAllowedTimeRule(),
      new ExtraEventStartDayRule(),
      new ExtraEventAllowedWeekdaysRule(),
      new InspAssignmentRule(),
      new LicenseAssignmentRule(),
      new OrdinaryAssignmentRule(),
      new TimeOffAssignmentRule(),
    ])
  }

  static defaultSteps(): AssingOptions[] {
    return [{
      onlyWorkersWhere: worker => worker.isDailyWorker() && Math.random() > .5,
      passDutyWhen: duty => duty.start !== 19,
      events: ExtraEventName.JIQUIA,
      inPairs: false,
      min: 1,
    }, {
      onlyWorkersWhere: worker => worker.isDailyWorker(),
      passDayWhen: day => day.date.isWeekEnd() === false,
      min: 3,
      dutyMinDistance: 1,
    }, {
      onlyWorkersWhere: worker => worker.isDailyWorker(),
      min: 2,
      inPairs: false,
    }, {
      onlyWorkersWhere: worker => worker.isInsp(),
      min: 1,
    }, {
      onlyWorkersWhere: worker => worker.isSubInsp(),
      passDayWhen: day => day.isWeekDay(DayOfWeek.MONDAY),
      min: 1,
      max: 2,
    }, {
      passDayWhen: day => day.isWeekDay(DayOfWeek.MONDAY),
      min: 1,
      max: 2,
    }, {
      min: 2,
      max: 3,
    }, {
      inPairs: false,
      min: 2,
      max: 3,
    }];
  }
}