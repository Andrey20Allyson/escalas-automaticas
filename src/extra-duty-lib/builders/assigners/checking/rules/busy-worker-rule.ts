import { DayOfExtraDuty, ExtraDuty, ExtraDutyTableConfig, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class BusyWorkerAssignmentRule implements AssignmentRule {
  isBusy(worker: WorkerInfo, config: ExtraDutyTableConfig) {
    return worker.isCompletelyBusy(config.dutyPositionSize) === false;
  }
  
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    return this.isBusy(worker, duty.config);
  }

  canAssignInDay(worker: WorkerInfo, day: DayOfExtraDuty): boolean {
    return this.isBusy(worker, day.config);
  }
}