import { table } from "console";
import { ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class InspAssignmentRule implements AssignmentRule {
  canAssignInDay(): boolean {
    return true;
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (worker.graduation !== 'insp') return true;

    return duty.gradQuantity('insp') < 1;
  }
}