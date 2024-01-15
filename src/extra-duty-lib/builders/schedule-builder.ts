import { ExtraDutyTable } from "../extra-duty-table";
import { WorkerInfo } from "../structs";

export interface ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}