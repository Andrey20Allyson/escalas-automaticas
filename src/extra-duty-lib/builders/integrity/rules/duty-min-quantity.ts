import { calculateDutyPontuation } from "../../assigners/jq-utils";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { RuleChecker } from "./rule-checker";

export class DutyMinQuantityChecker implements RuleChecker {
  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -calculateDutyPontuation(duty, integrity.table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}