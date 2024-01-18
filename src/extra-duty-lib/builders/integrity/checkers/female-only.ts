import { IntegrityFailure } from "../inconsistences/failure";
import { TableIntegrity } from "../table-integrity";
import { IntegrityChecker } from "./integrity-checker";

export class FemaleOnlyChecker implements IntegrityChecker {
  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (duty.genderIsOnly('female')) {
        integrity.registry(new IntegrityFailure('female only duty'));
      }
    }
  }
}