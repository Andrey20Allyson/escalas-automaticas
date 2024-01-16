import { ExtraDutyTable } from "../../extra-duty-table";
import { WorkerInfo } from "../../structs";
import { ScheduleBuilder } from "../schedule-builder";
import { JQScheduleAssigner } from "./assigner";

export class JQScheduleBuilder implements ScheduleBuilder {
  constructor(
    readonly tries: number,
  ) { }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    const bestClone = this.findBestClone(table, workers);
    if (!bestClone) return table;

    table.copy(bestClone);

    return table;
  }

  private findBestClone(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable | null {
    let tableClone = table.clone();
    let bestClone: ExtraDutyTable | null = null;

    for (let i = 0; i < this.tries; i++) {
      tableClone.clear();

      const assigner = new JQScheduleAssigner(tableClone);
      assigner
        .assign(workers)
        .analyse();

      tableClone.analyse();

      if (tableClone.integrity.isPerfect()) {
        return tableClone;
      }

      if (tableClone.isBetterThan(bestClone)) {
        bestClone = tableClone.clone();
      }
    }

    return bestClone;
  }
}