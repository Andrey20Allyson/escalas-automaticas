import { ExtraDuty, WorkerInfo } from "../../structs";
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

  private _find(predicate: (rule: AssignmentRule) => boolean, root: AssignmentRule = this): AssignmentRule | null {
    if (predicate(root)) return root;
    
    if (root instanceof AssignmentRuleStack) {
      for (const rule of root.rules) {
        const found = this._find(predicate, rule);
        
        if (found !== null) return found;
      }
    }

    return null;
  }

  find<T extends AssignmentRule>(predicate: (rule: AssignmentRule) => rule is T): T | null;
  find(predicate: (rule: AssignmentRule) => boolean): AssignmentRule | null;
  find(predicate: (rule: AssignmentRule) => boolean): AssignmentRule | null {
    return this._find(predicate);
  }

  static find<T extends AssignmentRule>(rule: AssignmentRule, predicate: (rule: AssignmentRule) => rule is T): T | null;
  static find(rule: AssignmentRule, predicate: (rule: AssignmentRule) => boolean): AssignmentRule | null;
  static find(rule: AssignmentRule, predicate: (rule: AssignmentRule) => boolean) {
    return new AssignmentRuleStack([rule]).find(predicate);
  }
}