import { ExtraDuty, ExtraDutyTableConfig, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class BusyWorkerAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return duty.table.limiter.isLimitOut(worker);
  }
}