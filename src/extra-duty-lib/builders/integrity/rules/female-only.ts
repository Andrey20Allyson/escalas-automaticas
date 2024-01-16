import { ExtraDutyTable } from "../../../structs/extra-duty-table";
import { IntegrityFailure } from "../failure";
import { TableIntegrity } from "../table-integrity";
import { RuleChecker } from "./rule-checker";

export class FemaleOnlyChecker implements RuleChecker {
  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (duty.genderIsOnly('female')) {
        integrity.registry(new IntegrityFailure('female only duty'));
      }
    }
  }
}