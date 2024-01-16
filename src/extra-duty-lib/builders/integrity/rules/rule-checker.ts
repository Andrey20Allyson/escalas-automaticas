import { TableIntegrity } from "../table-integrity";

export interface RuleChecker {
  check(integrity: TableIntegrity): void;
}