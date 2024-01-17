import { ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../structs";
import { AssignmentChecker } from "./checking";

export abstract class ScheduleAssigner {
  constructor(readonly assignmentChecker: AssignmentChecker) { }

  abstract assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
  
  assignWorker(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.assignmentChecker.checkDuty(worker, duty)) {
      duty.add(worker);

      return true;
    }

    return false;
  }
}