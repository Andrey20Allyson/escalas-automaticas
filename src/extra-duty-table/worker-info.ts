import { DaysOfWork, WorkTime } from "./parsers";

export class WorkerInfo {
  positionsLeft: number;

  constructor(
    readonly workerName: string,
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

  occupyPosition() {
    this.positionsLeft--;
  }

  isCompletelyBusy() {
    return this.positionsLeft <= 0;
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