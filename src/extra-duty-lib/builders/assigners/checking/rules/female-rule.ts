import { ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class FemaleAssignmentRule implements AssignmentRule {
  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    if (worker.gender !== 'female') return true;

    const duty = table
      .getDay(dayIndex)
      .getDuty(dutyIndex);

    return duty.genderQuantity('male') > 0;
  }

  canAssignInDay(): boolean {
    return true;
  }
}