import { ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class LicenseAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return worker.daysOfWork.licenseOn(duty.day.index);
  }
}