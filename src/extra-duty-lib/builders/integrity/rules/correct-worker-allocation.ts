import { ExtraDutyTable } from "../../../extra-duty-table/extra-duty-table";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { RuleChecker } from "./rule-checker";

export class CorrectWorkerAllocationChecker implements RuleChecker {
  calculatePenality(workerPositionsLeft: number) {
    return 100 * 1.4 * workerPositionsLeft ** 2
  }
  
  check(table: ExtraDutyTable, integrity: TableIntegrity): void {
    if (table.everyDutyHasMinQuatity()) return;

    for (const worker of table.workers()) {
      if (worker.cantWorkOnExtra()) continue;

      const penality = this.calculatePenality(worker.positionsLeft);

      integrity.registry(new IntegrityWarning(`workers hasn't correctly allocated`, penality));
    }
  }
}