import { ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class DutyLimitAssignmentRule implements AssignmentRule {
  canAssign(table: ExtraDutyTable, _worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    const duty = table
      .getDay(dayIndex)
      .getDuty(dutyIndex);

    return duty.getSize() <= table.config.dutyCapacity;
  }

  canAssignInDay(): boolean {
    return true;
  }
}