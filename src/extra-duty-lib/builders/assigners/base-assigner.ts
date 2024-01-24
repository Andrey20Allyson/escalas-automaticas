import { ExtraDutyTable, WorkerInfo, ExtraDuty } from "../../structs";
import { AssignmentRule } from "../rule-checking";
import { IScheduleAssigner } from "./assigner";

export abstract class BaseScheduleAssigner implements IScheduleAssigner {
  constructor(readonly checker: AssignmentRule) { }

  abstract assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;

  assignWorker(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.checker.canAssign(worker, duty)) {
      duty.add(worker);

      return true;
    }

    return false;
  }
}