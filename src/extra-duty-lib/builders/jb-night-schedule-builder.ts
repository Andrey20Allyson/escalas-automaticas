import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleBuilder } from "./schedule-builder";

export class JBNightScheduleBuilder implements ScheduleBuilder {
  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    throw new Error('Method not implemented.');
  }
}