import { AssignmentRuleStack } from "../rule-checking";
import {
  BusyWorkerAssignmentRule,
  DutyLimitAssignmentRule,
  FemaleAssignmentRule,
  InspAssignmentRule,
  LicenseAssignmentRule,
  OrdinaryAssignmentRule,
  TimeOffAssignmentRule
} from "../rule-checking/rules";
import { ScheduleAssignerV1 } from "./assigner-v1";

export class JQScheduleAssigner extends ScheduleAssignerV1 {
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