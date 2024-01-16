import { ExtraDutyTable, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "./assignment-rule";

export class AssignmentChecker {
  constructor(
    readonly rules: AssignmentRule[] = [],
  ) { }

  checkDay(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number): boolean {
    return this
      .rules
      .every(rule => rule.canAssignInDay(table, worker, dayIndex));
  }

  checkDuty(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, duty: number): boolean {
    return this
      .rules
      .every(rule => rule.canAssign(table, worker, dayIndex, duty));
  }
}