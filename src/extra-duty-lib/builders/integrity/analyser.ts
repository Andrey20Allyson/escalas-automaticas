import { ExtraDutyTable } from "../..";
import { IntegrityChecker } from "./checkers";
import { TableIntegrity } from "./table-integrity";

export class TableIntegrityAnalyser {
  private _events: string[] | null = null;

  constructor(
    private checkers: IntegrityChecker[] = [],
    private penalityLimit: number,
    events?: string | string[],
  ) {
    if (events !== undefined) {
      this._events = typeof events === 'string'
        ? [events]
        : events;
    }
  }

  analyse(table: ExtraDutyTable): TableIntegrity {
    const integrity = new TableIntegrity(table, this.penalityLimit);
    const events = this._events ?? [table.config.currentPlace];

    table.saveConfig();

    for (const eventName of events) {
      table.setCurrentEvent(eventName);

      for (const checker of this.checkers) {
        checker.check(integrity);
      }
    }

    table.restoreConfig();

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