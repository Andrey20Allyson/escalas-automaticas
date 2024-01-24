import { AssignmentRule, AssignmentRuleStack } from "../rule-checking";
import { JBNightAssignmentRule, JBNightAssignmentRuleOptions } from "../rule-checking/rules/jb-night-rule";
import { ScheduleAssignerV1 } from "./assigner-v1";
import { JQScheduleAssigner } from "./jq-assigner";

export interface JBAssignmentRulesOptions {
  nightRule?: JBNightAssignmentRuleOptions;
  extend?: AssignmentRule[];
}

export class JBScheduleAssigner extends ScheduleAssignerV1 {
  constructor(options?: JBAssignmentRulesOptions) {
    const extendedRules = options?.extend ?? [new JQScheduleAssigner().checker];
    
    const jbAssignmentChecker = new AssignmentRuleStack([
      new JBNightAssignmentRule(options?.nightRule),
    ]).use(...extendedRules);

    super(jbAssignmentChecker);
  }
}