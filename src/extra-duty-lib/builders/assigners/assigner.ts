import { ExtraDutyTable, WorkerInfo } from "../../structs";

export interface IScheduleAssigner {
  assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}