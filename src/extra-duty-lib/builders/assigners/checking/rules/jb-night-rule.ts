import { DaysOfWeek } from "../../../../../utils";
import { ExtraDuty, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class JBNightAssignmentRule implements AssignmentRule {
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    // TODO confirm if only daily workers can work at night
    return [DaysOfWeek.FRIDAY, DaysOfWeek.SATURDAY, DaysOfWeek.SUMDAY].includes(duty.weekDay) && worker.daysOfWork.isDailyWorker;
  }

  canAssignInDay(): boolean {
    return true;
  }
}