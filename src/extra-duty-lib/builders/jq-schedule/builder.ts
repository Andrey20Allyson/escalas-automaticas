import { ExtraDutyTable, ExtraPlace, WorkerInfo } from "../../structs";
import { JQScheduleAssigner } from "../assigners/jq-assigner";
import { DefaultScheduleClassifier } from "../classifiers/classifier";
import { ScheduleBuilder } from "../schedule-builder";

export class JQScheduleBuilder implements ScheduleBuilder {
  readonly classifier: DefaultScheduleClassifier;
  
  constructor(
    tries: number,
  ) {
    this.classifier = new DefaultScheduleClassifier(tries, new JQScheduleAssigner());
  }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    table.config.currentPlace = ExtraPlace.JIQUIA;

    const bestClone = this.classifier.classify(table, workers);

    table.copy(bestClone);

    return table;
  }
}