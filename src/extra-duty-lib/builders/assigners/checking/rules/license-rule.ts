import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class LicenseAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return this.canAssignInDay(worker, duty.day);
  }

  canAssignInDay(worker: WorkerInfo, day: DayOfExtraDuty): boolean {
    return worker.daysOfWork.licenseOn(day.index);
  }
}