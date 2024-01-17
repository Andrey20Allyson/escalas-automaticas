import { ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class BusyWorkerAssignmentRule implements AssignmentRule {
  canAssign(table: ExtraDutyTable, worker: WorkerInfo): boolean {
    return this.canAssignInDay(table, worker);
  }

  canAssignInDay(table: ExtraDutyTable, worker: WorkerInfo): boolean {
    return worker.isCompletelyBusy(table.config.dutyPositionSize) === false;
  }
}