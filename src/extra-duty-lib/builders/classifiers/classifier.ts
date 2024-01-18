import { ExtraDutyTable } from "../../structs/extra-duty-table";
import { WorkerInfo } from "../../structs";
import { DefaultTableIntegrityAnalyser, TableIntegrity } from "../integrity";
import { ScheduleAssigner } from "../assigners/assigner";

export interface ScheduleClassifier {
  classify(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable;
}

export class DefaultScheduleClassifier implements ScheduleClassifier {
  readonly tries: number;
  
  constructor(
    tries: number,
    readonly assigner: ScheduleAssigner,
    readonly penalityLimit?: number,
  ) {
    this.tries = tries < 1 ? 1 : tries;
  }

  classify(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const tableClone = table.clone();
    const analyser = new DefaultTableIntegrityAnalyser(this.penalityLimit);
    let bestIntegrity: TableIntegrity | null = null;

    for (let i = 0; i < this.tries; i++) {
      tableClone.clear(tableClone.config.currentPlace);

      this.assigner.assignInto(tableClone, workers);

      const integrity = analyser.analyse(tableClone);

      if (integrity.isPerfect()) {
        return integrity.table;
      }

      if (bestIntegrity === null || integrity.isBetterThan(bestIntegrity)) {
        bestIntegrity = integrity.clone();
      }
    }

    if (bestIntegrity === null) throw new Error(`Unespected null`);
    return bestIntegrity.table;
  }
}