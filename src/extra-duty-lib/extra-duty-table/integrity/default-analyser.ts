import { TableIntegrityAnalyser } from "./analyser";
import { GCMOnlyChecker, FemaleOnlyChecker, DutyMinQuantityChecker, CorrectWorkerAllocationChecker } from "./rules";

export class DefaultTableIntegrityAnalyser extends TableIntegrityAnalyser {
  constructor() {
    super([
      new GCMOnlyChecker(75),
      new FemaleOnlyChecker(),
      new DutyMinQuantityChecker(),
      new CorrectWorkerAllocationChecker(),
    ]);
  }
}