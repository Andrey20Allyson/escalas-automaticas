import { ExtraDutyTable, WorkerInfo, ExtraDuty } from "../../structs";
import { AssignmentRule } from "../rule-checking";
import { IScheduleAssigner } from "./assigner";

export abstract class BaseScheduleAssigner implements IScheduleAssigner {
  constructor(readonly checker: AssignmentRule) { }

  abstract assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;

  assignWorker(worker: WorkerInfo, duty: ExtraDuty): boolean;
  assignWorker(worker: WorkerInfo, duties: ExtraDuty[]): boolean;
  assignWorker(worker: WorkerInfo, arg1: ExtraDuty | ExtraDuty[]): boolean {
    if (Array.isArray(arg1)) {
      const canAssign = arg1.every(duty => this.checker.canAssign(worker, duty));
      if (canAssign === false) return false;
      
      arg1.forEach(duty => duty.add(worker));
      
      return true;
    }
    
    if (this.checker.canAssign(worker, arg1) === false) return false;

    arg1.add(worker);

    return true;
  }
}