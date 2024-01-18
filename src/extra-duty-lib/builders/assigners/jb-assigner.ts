import { ScheduleAssigner } from "./assigner";
import { AssignmentChecker, AssignmentRule } from "./checking";
import { JBNightAssignmentRule, JBNightAssignmentRuleOptions } from "./checking/rules/jb-night-rule";
import { JQScheduleAssigner } from "./jq-assigner";

export interface JBAssignmentRulesOptions {
  nightRule?: JBNightAssignmentRuleOptions;
  extend?: AssignmentRule[];
}

export class JBScheduleAssigner extends ScheduleAssigner {
  constructor(options?: JBAssignmentRulesOptions) {
    const extendedRules = options?.extend ?? new JQScheduleAssigner().assignmentChecker.rules;
    
    const jbAssignmentChecker = new AssignmentChecker([
      new JBNightAssignmentRule(options?.nightRule),
    ]).use(...extendedRules);

    super(jbAssignmentChecker);
  }
}