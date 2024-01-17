import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "./assignment-rule";

export class AssignmentChecker {
  constructor(
    readonly rules: AssignmentRule[] = [],
  ) { }

  checkDay(worker: WorkerInfo, day: DayOfExtraDuty): boolean {
    return this
      .rules
      .every(rule => rule.canAssignInDay(worker, day));
  }

  checkDuty(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return this
      .rules
      .every(rule => rule.canAssign(worker, duty));
  }
}