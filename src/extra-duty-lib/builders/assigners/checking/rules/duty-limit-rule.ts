import { ExtraDuty, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class DutyLimitAssignmentRule implements AssignmentRule {
  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    return duty.getSize() <= duty.config.dutyCapacity;
  }
}