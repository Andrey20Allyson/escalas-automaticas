import { TableIntegrityAnalyser } from "./analyser";
import { GCMOnlyChecker, FemaleOnlyChecker, DutyMinQuantityChecker, CorrectWorkerAllocationChecker } from "./rules";

export class DefaultTableIntegrityAnalyser extends TableIntegrityAnalyser {
  constructor() {
    super([
      new GCMOnlyChecker(5000),
      new FemaleOnlyChecker(),
      new DutyMinQuantityChecker(),
      new CorrectWorkerAllocationChecker(),
    ]);
  }
}