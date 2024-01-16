import { ExtraDutyTable, WorkerInfo } from "../../../structs";

export interface AssignmentRule {
  canAssignInDay(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number): boolean;
  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean;
}