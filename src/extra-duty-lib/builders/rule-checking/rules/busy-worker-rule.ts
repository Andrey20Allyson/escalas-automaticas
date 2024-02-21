import { ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class BusyWorkerAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, arg1: ExtraDuty | ExtraDutyTable): boolean {
    const table = arg1 instanceof ExtraDutyTable ? arg1 : arg1.table;
    
    return table.limiter.isLimitOut(worker) === false;
  }
}