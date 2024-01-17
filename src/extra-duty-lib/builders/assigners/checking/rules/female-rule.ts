import { ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class FemaleAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (worker.gender !== 'female') return true;

    return duty.genderQuantity('male') > 0;
  }

  canAssignInDay(): boolean {
    return true;
  }
}