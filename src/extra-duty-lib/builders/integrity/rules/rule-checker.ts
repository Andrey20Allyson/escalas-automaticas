import { ExtraDutyTable } from "../../../structs/extra-duty-table";
import { TableIntegrity } from "../table-integrity";

export interface RuleChecker {
  check(table: ExtraDutyTable, integrity: TableIntegrity): void;
}