import { TableIntegrityAnalyser } from "./analyser";
import { GCMOnlyChecker, FemaleOnlyChecker, DutyMinQuantityChecker, CorrectWorkerAllocationChecker } from "./rules";

export class DefaultTableIntegrityAnalyser extends TableIntegrityAnalyser {
  constructor(penalityLimit: number = 100_000) {
    super([
      new GCMOnlyChecker(75),
      new FemaleOnlyChecker(),
      new DutyMinQuantityChecker(),
      new CorrectWorkerAllocationChecker(),
    ], penalityLimit);
  }
}