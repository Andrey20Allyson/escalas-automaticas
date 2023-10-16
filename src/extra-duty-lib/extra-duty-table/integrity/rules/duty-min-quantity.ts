import { calculateDutyPontuation } from "../../utils";
import { ExtraDutyTableV2 } from "../../v2";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { RuleChecker } from "./rule-checker";

export class DutyMinQuantityChecker implements RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    for (const duty of table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -calculateDutyPontuation(duty, table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}