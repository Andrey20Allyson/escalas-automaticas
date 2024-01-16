import { calculateDutyPontuation } from "../../assigners/jq-utils";
import { ExtraDutyTable } from "../../../structs";
import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../warning";
import { RuleChecker } from "./rule-checker";

export class DutyMinQuantityChecker implements RuleChecker {
  check(table: ExtraDutyTable, integrity: TableIntegrity): void {
    for (const duty of table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -calculateDutyPontuation(duty, table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}