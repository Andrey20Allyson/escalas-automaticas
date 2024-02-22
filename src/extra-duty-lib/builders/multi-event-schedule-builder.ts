import { DayOfWeek } from "../../utils";
import { ExtraDutyTable, ExtraEventName, WorkerInfo } from "../structs";
import { AssingOptions, MultiStepScheduleAssigner } from "./assigners/multi-step-assigner";
import { ScheduleClassifier } from "./classifiers/classifier";
import { MultiEventScheduleClassifier } from "./classifiers/multi-event-classifier";
import { DefaultTableIntegrityAnalyser, TableIntegrityAnalyser } from "./integrity";
import { ScheduleBuilder } from "./schedule-builder";

export interface DefaultMultiEventScheduleBuilderOptions {
  tries?: number;
  penalityLimit?: number;
}

export class MultiEventScheduleBuilder implements ScheduleBuilder {
  constructor(readonly classifier: ScheduleClassifier) { }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    const bestClone = this.classifier.classify(table, workers);

    table.copy(bestClone);

    return table;
  }

  static default(options: DefaultMultiEventScheduleBuilderOptions = {}): ScheduleBuilder {
    const {
      tries = 500,
    } = options;

    const checker = MultiStepScheduleAssigner.defaultChecker();

    const events = [
      ExtraEventName.JARDIM_BOTANICO_DAYTIME,
      ExtraEventName.JIQUIA,
    ];

    const steps: AssingOptions[] = [{
      onlyWorkersWhere: worker => worker.isDailyWorker() && Math.random() > .5,
      passDutyWhen: duty => duty.start !== 19,
      events: ExtraEventName.JIQUIA,
      inPairs: false,
    }, {
      onlyWorkersWhere: worker => worker.isDailyWorker(),
      passDayWhen: day => day.date.isWeekEnd() === false,
      events,
      min: 2,
      dutyMinDistance: 1,
    }, {
      onlyWorkersWhere: worker => worker.isDailyWorker(),
      events,
      inPairs: false,
    }, {
      onlyWorkersWhere: worker => worker.isInsp(),
      events,
    }, {
      onlyWorkersWhere: worker => worker.isSubInsp(),
      passDayWhen: day => day.isWeekDay(DayOfWeek.MONDAY),
      events,
    }, {
      onlyWorkersWhere: worker => worker.isDailyWorker(),
      events: ExtraEventName.JARDIM_BOTANICO_DAYTIME,
      min: 2,
      inPairs: false,
    }, {
      passDayWhen: day => day.isWeekDay(DayOfWeek.MONDAY),
      events,
      max: 2,
    }, {
      events,
      min: 2,
      dutyMinDistance: 4,
    }, {
      events,
      min: 2,
      inPairs: false,
      dutyMinDistance: 2,
    }, {
      events,
      min: 2,
      max: 3,
      dutyMinDistance: 1,
    }, {
      events,
      min: 3,
      inPairs: false,
      dutyMinDistance: 1,
    }];

    const assigner = new MultiStepScheduleAssigner(
      checker,
      steps,
    );

    const analyser = new DefaultTableIntegrityAnalyser(options.penalityLimit, events);

    const classifier = new MultiEventScheduleClassifier(
      tries,
      assigner,
      analyser,
    );

    return new MultiEventScheduleBuilder(
      classifier,
    );
  }
}