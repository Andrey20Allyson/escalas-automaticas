import { ScheduleAssigner } from "./assigner";
import { AssignmentRuleStack } from "./checking";
import { BusyWorkerAssignmentRule, DutyLimitAssignmentRule, FemaleAssignmentRule, InspAssignmentRule, LicenseAssignmentRule, OrdinaryAssignmentRule, TimeOffAssignmentRule } from "./checking/rules";

export class JQScheduleAssigner extends ScheduleAssigner {
  constructor() {
    super(
      new AssignmentRuleStack([
        new BusyWorkerAssignmentRule(),
        new DutyLimitAssignmentRule(),
        new FemaleAssignmentRule(),
        new InspAssignmentRule(),
        new LicenseAssignmentRule(),
        new OrdinaryAssignmentRule(),
        new TimeOffAssignmentRule(),
      ])
    )
  }
}