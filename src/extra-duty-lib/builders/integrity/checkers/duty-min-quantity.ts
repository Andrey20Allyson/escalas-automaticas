import { calculateDutyPontuation } from "../../assigners/utils";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { IntegrityChecker } from "../integrity-checker";

export class DutyMinQuantityChecker implements IntegrityChecker {
  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -calculateDutyPontuation(duty, integrity.table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}