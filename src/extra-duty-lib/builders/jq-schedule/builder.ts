import { ExtraDutyTable } from "../../extra-duty-table";
import { WorkerInfo } from "../../structs";
import { DefaultScheduleClassifier } from "../classifiers/classifier";
import { ScheduleBuilder } from "../schedule-builder";
import { JQScheduleAssigner } from "../assigners/jq-assigner";

export class JQScheduleBuilder implements ScheduleBuilder {
  readonly classifier: DefaultScheduleClassifier;
  
  constructor(
    tries: number,
  ) {
    this.classifier = new DefaultScheduleClassifier(tries, new JQScheduleAssigner());
  }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    const bestClone = this.classifier.classify(table, workers);
    if (!bestClone) return table;

    table.copy(bestClone);

    return table;
  }
}