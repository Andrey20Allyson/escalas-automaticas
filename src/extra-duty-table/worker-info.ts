import { DaysOfWork, WorkTime } from "./parsers";

export class WorkerInfo {
  positionsLeft: number;

  constructor(
    readonly name: string,
    readonly workTime: WorkTime,
    readonly daysOfWork: DaysOfWork,
    readonly startPositionsLeft: number = 10,
  ) {
    this.startPositionsLeft = 10;
    this.positionsLeft = this.startPositionsLeft;
  }

  resetPositionsLeft() {
    this.positionsLeft = this.startPositionsLeft;
  }

  occupyPositions(num = 1) {
    this.positionsLeft -= num;
  }

  leavePositions(num = 1) {
    this.positionsLeft += num;
  }

  isPositionsLeftEqualsToStart() {
    return this.positionsLeft === this.startPositionsLeft;
  }

  isCompletelyBusy(positions = 1) {
    return this.positionsLeft - positions < 0;
  }

  static parse(workerName: string, hourlyText: string) {
    if (hourlyText.includes('FÉRIAS')) return;

    const workTime = WorkTime.parse(hourlyText);
    if (!workTime) throw new Error(`Can't parse workTime of "${workerName}"`);

    const daysOfWork = DaysOfWork.parse(hourlyText);
    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${workerName}"!`);

    return new this(workerName, workTime, daysOfWork);
  }

  static fromName(name: string) {
    return new WorkerInfo(
      name,
      new WorkTime(7, 8),
      DaysOfWork.fromDays([]),
    );
  }
}