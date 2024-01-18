import { ExtraDuty, WorkerInfo } from "../../../structs";

export interface AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean;
}