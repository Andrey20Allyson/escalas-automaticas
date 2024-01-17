import { DayOfExtraDuty, ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../structs";

export interface AssignmentRule {
  canAssignInDay(worker: WorkerInfo, day: DayOfExtraDuty): boolean;
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean;
}