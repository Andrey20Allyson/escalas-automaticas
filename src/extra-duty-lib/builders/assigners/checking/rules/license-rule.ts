import { ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class LicenseAssignmentRule implements AssignmentRule {
  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number): boolean {
    return this.canAssignInDay(table, worker, dayIndex);
  }

  canAssignInDay(_table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number): boolean {
    return worker.daysOfWork.licenseOn(dayIndex);
  }
}