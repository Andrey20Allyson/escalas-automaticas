import { IntegrityInconsistence } from "./inconsistence";

export class IntegrityWarning extends IntegrityInconsistence {
  private _penalityAcc;

  constructor(name: string, penality: number, message?: string) {
    super(name, message);

    this._penalityAcc = penality;
  }

  getPenalityAcc(): number {
    return this._penalityAcc;
  }

  join(inconsistence: IntegrityInconsistence): void {
    super.join(inconsistence);

    if (inconsistence instanceof IntegrityWarning) {
      this._penalityAcc += inconsistence._penalityAcc;
    }
  }
}