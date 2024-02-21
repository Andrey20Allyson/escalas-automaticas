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
import { ExtraEventAllowedTimeRule } from "../rule-checking/rules/extra-event-allowed-time-rule";
import { ExtraEventAllowedWeekdaysRule } from "../rule-checking/rules/extra-event-allowed-weekdays-rule";
import { ExtraEventStartDayRule } from "../rule-checking/rules/extra-event-start-day";
import { ScheduleAssignerV1 } from "./assigner-v1";

export class DefaultScheduleAssigner extends ScheduleAssignerV1 {
  constructor() {
    super(
      new AssignmentRuleStack([
        new BusyWorkerAssignmentRule(),
        new DutyLimitAssignmentRule(),
        new FemaleAssignmentRule(),
        new ExtraEventAllowedTimeRule(),
        new ExtraEventStartDayRule(),
        new ExtraEventAllowedWeekdaysRule(),
        new InspAssignmentRule(),
        new LicenseAssignmentRule(),
        new OrdinaryAssignmentRule(),
        new TimeOffAssignmentRule(),
      ])
    )
  }
}