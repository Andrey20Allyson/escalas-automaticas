import { ExtraDutyTable, WorkerInfo } from "../structs";

export interface ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}