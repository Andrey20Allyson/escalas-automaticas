import { ExtraDutyTable } from "../..";
import { RuleChecker } from "./rules";
import { TableIntegrity } from "./table-integrity";

export class TableIntegrityAnalyser {
  constructor(private checkers: RuleChecker[] = []) { }

  analyse(table: ExtraDutyTable, integrity: TableIntegrity = new TableIntegrity()): TableIntegrity {
    for (const checker of this.checkers) {
      checker.check(table, integrity);
    }

    return integrity;
  }

  addRule(checker: RuleChecker) {
    this.checkers.push(checker);
  }

  addRules(checkers: RuleChecker[]) {
    for (const checker of checkers) {
      this.addRule(checker);
    }
  }

  removeAllRules() {
    this.checkers = [];
  }
}