import { ExtraDutyTable } from "../..";
import { IntegrityChecker } from "./checkers";
import { TableIntegrity } from "./table-integrity";

export class TableIntegrityAnalyser {
  constructor(
    private checkers: IntegrityChecker[] = [],
    private penalityLimit: number,
  ) { }

  analyse(table: ExtraDutyTable): TableIntegrity {
    const integrity = new TableIntegrity(table, this.penalityLimit);

    for (const checker of this.checkers) {
      checker.check(integrity);
    }

    return integrity;
  }

  addRule(checker: IntegrityChecker) {
    this.checkers.push(checker);
  }

  addRules(checkers: IntegrityChecker[]) {
    for (const checker of checkers) {
      this.addRule(checker);
    }
  }

  removeAllRules() {
    this.checkers = [];
  }
}