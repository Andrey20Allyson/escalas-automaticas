import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "./assignment-rule";

export class AssignmentChecker {
  readonly rules: ReadonlyArray<AssignmentRule>;
  
  constructor(
    rules: AssignmentRule[] = [],
  ) {
    this.rules = [...rules];
  }

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

  use(...rules: AssignmentRule[]): AssignmentChecker {
    return new AssignmentChecker(this.rules.concat(rules));
  }

  extend(...checkers: AssignmentChecker[]): AssignmentChecker {
    return this.use(...checkers.flatMap(checker => checker.rules));
  }
}