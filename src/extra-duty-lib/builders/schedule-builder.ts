import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleClassifier } from "./classifiers/classifier";

export interface ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}

export class ClassifingScheduleBuilder implements ScheduleBuilder {
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