import { isInteger } from "../../../utils";

export class InvalidIdentifierError extends Error { }

export class WorkerIdentifier {
  readonly id: number;
  private invalidations?: InvalidIdentifierError[];

  constructor(
    readonly preId: number,
    readonly postId: number,
  ) {
    this.validate();
    this.id = this.createId();
  }

  private createId() {
    return this.isValid() ? this.preId * 10 + this.postId : NaN;
  }

  private validate() {
    if (isNaN(this.preId) || isNaN(this.postId)) {
      this.addInvalidation(
        new InvalidIdentifierError(`Recived a NaN!`)
      );
    }

    if (!isInteger(this.preId) || !isInteger(this.postId)) {
      this.addInvalidation(
        new InvalidIdentifierError(`Recived a float point value`)
      );
    }

    if (this.postId > 9 || this.postId < 0) {
      this.addInvalidation(
        new InvalidIdentifierError(`postId shold be in [0..9] range!`)
      );
    }
  }

  private addInvalidation(error: InvalidIdentifierError): void {
    if (this.invalidations === undefined) {
      this.invalidations = [];
    }

    this.invalidations.push(error);
  }

  getInvalidations(): InvalidIdentifierError[] {
    return [...this.invalidations ?? []] ;
  }

  isValid(): boolean {
    return this.getInvalidations().length === 0;
  }
}