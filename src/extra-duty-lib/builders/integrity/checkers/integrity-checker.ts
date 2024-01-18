import { TableIntegrity } from "../table-integrity";

export interface IntegrityChecker {
  check(integrity: TableIntegrity): void;
}