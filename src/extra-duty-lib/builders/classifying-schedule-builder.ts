import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleClassifier } from "./classifiers/classifier";
import { ScheduleBuilder } from "./schedule-builder";

export class ClassifyingScheduleBuilder implements ScheduleBuilder {
  constructor(
    readonly extraPlace: string,
    readonly classifier: ScheduleClassifier,
  ) { }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    table.config.currentPlace = this.extraPlace;

    const bestClone = this.classifier.classify(table, workers);

    table.copy(bestClone);

    return table;
  }
}