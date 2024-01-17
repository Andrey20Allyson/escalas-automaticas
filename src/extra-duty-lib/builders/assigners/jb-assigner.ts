import { ScheduleAssigner } from "./assigner";
import { AssignmentChecker } from "./checking";
import { JQScheduleAssigner } from "./jq-assigner";

export class JBScheduleAssigner extends ScheduleAssigner {
  constructor() {
    const jqAssignmentChecker = new JQScheduleAssigner().assignmentChecker;
    const jbAssignmentChecker = new AssignmentChecker([
      
    ]).extend(jqAssignmentChecker);

    super(jbAssignmentChecker);
  }
}