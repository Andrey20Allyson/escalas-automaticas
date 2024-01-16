import { IntegrityFailure } from "./failure";
import { IntegrityWarning } from "./warning";

export class TableIntegrity {
  readonly failures: Map<string, IntegrityFailure> = new Map();
  readonly warnings: Map<string, IntegrityWarning> = new Map();
  private _warningPenalityAcc = 0;

  constructor(public maxAcceptablePenalityAcc: number | null = null) { }

  clear() {
    this.failures.clear();
    this.warnings.clear();

    this._warningPenalityAcc = 0;
  }

  registry(inconsistence: IntegrityFailure | IntegrityWarning) {
    if (inconsistence instanceof IntegrityFailure) {
      return this._registry(this.failures, inconsistence);
    }

    this._addWarningPenality(inconsistence.getPenalityAcc());

    return this._registry(this.warnings, inconsistence);
  }

  private _addWarningPenality(penality: number) {
    this._warningPenalityAcc += penality;
  }

  getWarningPenality() {
    return this._warningPenalityAcc;
  }

  penalityIsAcceptable() {
    return this.maxAcceptablePenalityAcc === null || this._warningPenalityAcc <= this.maxAcceptablePenalityAcc;
  }

  isFailureFree() {
    return this.failures.size === 0;
  }

  isCompliant() {
    return this.isFailureFree() && this.penalityIsAcceptable();
  }

  isPerfect() {
    return this.isFailureFree() && this.getWarningPenality() === 0;
  }

  isBetterThan(otherIntegrity: TableIntegrity) {
    if (this.isFailureFree()) {
      if (!otherIntegrity.isFailureFree()) return true;
    } else {
      if (otherIntegrity.isFailureFree()) return false;
    }

    return this.getWarningPenality() < otherIntegrity.getWarningPenality();
  }

  private _registry<T extends IntegrityFailure | IntegrityWarning>(map: Map<string, T>, inconsistence: T) {
    let existentInconsistence = map.get(inconsistence.name);

    if (!existentInconsistence) {
      existentInconsistence = inconsistence;

      map.set(existentInconsistence.name, existentInconsistence);
    } else {
      existentInconsistence.join(inconsistence);
    }
  }
}