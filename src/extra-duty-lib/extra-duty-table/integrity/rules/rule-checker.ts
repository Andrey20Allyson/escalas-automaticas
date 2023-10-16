import { ExtraDutyTableV2 } from "../../v2";
import { TableIntegrity } from "../table-integrity";

export interface RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void;
}