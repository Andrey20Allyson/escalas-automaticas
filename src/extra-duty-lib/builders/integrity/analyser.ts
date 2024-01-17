import { ExtraDutyTable } from "../..";
import { RuleChecker } from "./rules";
import { TableIntegrity } from "./table-integrity";

export class TableIntegrityAnalyser {
  constructor(
    private checkers: RuleChecker[] = [],
    private penalityLimit: number,
  ) { }

  analyse(table: ExtraDutyTable): TableIntegrity {
    const integrity = new TableIntegrity(table, this.penalityLimit);

    for (const checker of this.checkers) {
      checker.check(integrity);
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