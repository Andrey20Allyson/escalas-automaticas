import { ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "./assignment-rule";

export class AssignmentRuleStack implements AssignmentRule {
  readonly rules: ReadonlyArray<AssignmentRule>;
  
  constructor(
    rules: AssignmentRule[] = [],
  ) {
    this.rules = [...rules];
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return this
      .rules
      .every(rule => rule.canAssign(worker, duty));
  }

  use(...rules: AssignmentRule[]): AssignmentRuleStack {
    return new AssignmentRuleStack(this.rules.concat(rules));
  }
}