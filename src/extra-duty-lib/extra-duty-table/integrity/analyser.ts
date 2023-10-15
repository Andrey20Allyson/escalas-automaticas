import { WorkerInfo } from "../../structs";
import { calculateDutyPontuation } from "../utils";
import { ExtraDutyTableV2 } from "../v2";
import { IntegrityFailure } from "./failure";
import { TableIntegrity } from "./table-integrity";
import { IntegrityWarning } from "./warning";

export interface RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void;
}

export class TableIntegrityAnalyser {
  constructor(private checkers: RuleChecker[] = []) { }

  analyse(table: ExtraDutyTableV2, integrity: TableIntegrity = new TableIntegrity()): TableIntegrity {
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

  static fromDefault() {
    return new TableIntegrityAnalyser([
      new GCMOnlyChecker(5000),
      new FemaleOnlyChecker(),
      new DutyMinQuantityChecker(),
      new CorrectWorkerAllocationChecker(),
    ]);
  }
}

export class GCMOnlyChecker implements RuleChecker {
  constructor(
    public penality: number = 5000,
  ) { }

  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    let numOfGraduatePair = 0;
    let numOfDutiesGCMOnly = 0;

    for (const duty of table.iterDuties()) {
      if (duty.gradIsOnly('gcm')) numOfDutiesGCMOnly++;

      if (duty.graduateQuantity() >= 2) numOfGraduatePair++;
    }

    if (numOfDutiesGCMOnly > 0) {
      const warning = new IntegrityWarning('gcm only duty', numOfGraduatePair * this.penality);
      warning.accumulate = numOfDutiesGCMOnly;

      integrity.registry(warning);
    }
  }
}

export class FemaleOnlyChecker implements RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    for (const duty of table.iterDuties()) {
      if (duty.genderIsOnly('female')) {
        integrity.registry(new IntegrityFailure('female only duty'));
      }
    }
  }
}

export class DutyMinQuantityChecker implements RuleChecker {
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    for (const duty of table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -calculateDutyPontuation(duty, table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}

export class CorrectWorkerAllocationChecker implements RuleChecker {
  calculatePenality(workerPositionsLeft: number) {
    return 100 * 1.4 * workerPositionsLeft ** 2
  }
  
  check(table: ExtraDutyTableV2, integrity: TableIntegrity): void {
    if (table.everyDutyHasMinQuatity()) return;

    for (const worker of table.workers()) {
      if (worker.cantWorkOnExtra()) continue;

      const penality = this.calculatePenality(worker.positionsLeft);

      integrity.registry(new IntegrityWarning(`workers hasn't correctly allocated`, penality));
    }
  }
}