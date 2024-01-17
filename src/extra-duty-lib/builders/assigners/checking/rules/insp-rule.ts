import { ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class InspAssignmentRule implements AssignmentRule {
  canAssignInDay(): boolean {
    return true;
  }

  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    if (worker.graduation !== 'insp') return true;

    const duty = table
      .getDay(dayIndex)
      .getDuty(dutyIndex);

    return duty.gradQuantity('insp') < 1;
  }
}