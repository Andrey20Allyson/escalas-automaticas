import { ScheduleAssigner } from "./assigner";
import { AssignmentChecker } from "./checking";
import { BusyWorkerAssignmentRule, DutyLimitAssignmentRule, FemaleAssignmentRule, InspAssignmentRule, LicenseAssignmentRule, OrdinaryAssignmentRule, TimeOffAssignmentRule } from "./checking/rules";

export class JQScheduleAssigner extends ScheduleAssigner {
  constructor() {
    super(
      new AssignmentChecker([
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