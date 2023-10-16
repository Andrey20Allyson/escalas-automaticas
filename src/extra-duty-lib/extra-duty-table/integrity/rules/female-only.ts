import { ExtraDutyTableV2 } from "../../v2";
import { IntegrityFailure } from "../failure";
import { TableIntegrity } from "../table-integrity";
import { RuleChecker } from "./rule-checker";

export class FemaleOnlyChecker implements RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    for (const duty of table.iterDuties()) {
      if (duty.genderIsOnly('female')) {
        integrity.registry(new IntegrityFailure('female only duty'));
      }
    }
  }
}