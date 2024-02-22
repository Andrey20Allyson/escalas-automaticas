import { iterRange } from "../../../utils";
import { ExtraDutyTable, WorkerInfo } from "../../structs";
import { IScheduleAssigner } from "../assigners/assigner";
import { TableIntegrity, TableIntegrityAnalyser } from "../integrity";
import { ScheduleClassifier } from "./classifier";

export class MultiEventScheduleClassifier implements ScheduleClassifier {
  readonly tries: number;

  constructor(
    tries: number,
    readonly assigner: IScheduleAssigner,
    readonly analyser: TableIntegrityAnalyser,
  ) {
    this.tries = Math.max(tries, 1);
  }

  classify(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    const tableClone = table.clone();
    let bestIntegrity: TableIntegrity | null = null;
    
    for (const _ of iterRange(0, this.tries)) {
      tableClone.clear();

      this.assigner.assignInto(tableClone, workers);

      const integrity = this.analyser.analyse(tableClone);

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