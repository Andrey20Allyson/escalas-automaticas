import { ExtraDutyTable } from "../../../structs";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { IntegrityChecker } from "../integrity-checker";

export class CorrectWorkerAllocationChecker implements IntegrityChecker {
  calculatePenality(workerPositionsLeft: number) {
    return 100 * 1.4 * workerPositionsLeft ** 2
  }
  
  check(integrity: TableIntegrity): void {
    const isWorkerInsuficient = Array.from(integrity.table.iterDuties()).some(duty => duty.isWorkerInsuficient());
    
    if (!isWorkerInsuficient) return;

    for (const worker of integrity.table.workers()) {
      if (worker.daysOfWork.hasDaysOff() === false) continue;

      const penality = this.calculatePenality(integrity.table.limiter.positionsLeftOf(worker));

      integrity.registry(new IntegrityWarning(`workers hasn't correctly allocated`, penality));
    }
  }
}