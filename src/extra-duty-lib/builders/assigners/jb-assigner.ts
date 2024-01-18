import { ScheduleAssigner } from "./assigner";
import { AssignmentRuleStack, AssignmentRule } from "./checking";
import { JBNightAssignmentRule, JBNightAssignmentRuleOptions } from "./checking/rules/jb-night-rule";
import { JQScheduleAssigner } from "./jq-assigner";

export interface JBAssignmentRulesOptions {
  nightRule?: JBNightAssignmentRuleOptions;
  extend?: AssignmentRule[];
}

export class JBScheduleAssigner extends ScheduleAssigner {
  constructor(options?: JBAssignmentRulesOptions) {
    const extendedRules = options?.extend ?? [new JQScheduleAssigner().checker];
    
    const jbAssignmentChecker = new AssignmentRuleStack([
      new JBNightAssignmentRule(options?.nightRule),
    ]).use(...extendedRules);

    super(jbAssignmentChecker);
  }
}