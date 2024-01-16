import { ExtraDutyTable } from "../../extra-duty-table";
import { WorkerInfo } from "../../structs";

export interface ScheduleAssigner {
  assignInto(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}

export interface ScheduleClassifier {
  classify(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}

export class DefaultScheduleClassifier implements ScheduleClassifier {
  readonly tries: number;
  
  constructor(
    tries: number,
    readonly assigner: ScheduleAssigner,
  ) {
    this.tries = tries < 1 ? 1 : tries;
  }

  classify(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const tableClone = table.clone();
    let bestClone: ExtraDutyTable | null = null;

    for (let i = 0; i < this.tries; i++) {
      tableClone.clear();

      const integrity = this.assigner
        .assignInto(tableClone, workers)
        .analyse();

      if (integrity.isPerfect()) {
        return tableClone;
      }

      if (bestClone === null || tableClone.isBetterThan(bestClone)) {
        bestClone = tableClone.clone();
      }
    }

    return bestClone!;
  }
}