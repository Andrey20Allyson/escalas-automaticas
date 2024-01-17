import { ScheduleAssigner } from "./assigner";
import { AssignmentChecker } from "./checking";
import { JBNightAssignmentRule } from "./checking/rules/jb-night-rule";
import { JQScheduleAssigner } from "./jq-assigner";

export class JBScheduleAssigner extends ScheduleAssigner {
  constructor() {
    const jqAssignmentChecker = new JQScheduleAssigner().assignmentChecker;
    const jbAssignmentChecker = new AssignmentChecker([
      new JBNightAssignmentRule(),
    ]).extend(jqAssignmentChecker);

    super(jbAssignmentChecker);
  }
}