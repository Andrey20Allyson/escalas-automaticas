import { ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class InspAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (worker.graduation !== 'insp') return true;

    return duty.gradQuantity('insp') < 1;
  }
}