import { ExtraDutyTable } from "../extra-duty-table";
import { WorkerInfo } from "../structs";
import { ScheduleBuilder } from "./schedule-builder";

export class JBDayScheduleBuilder implements ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    throw new Error('Method not implemented.');
  }
}