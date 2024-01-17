import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleClassifier } from "./classifiers/classifier";

export interface ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}