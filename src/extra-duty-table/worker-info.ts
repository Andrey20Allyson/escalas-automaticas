import { DaysOfWork, WorkTime } from "./parsers";

export class WorkerInfo {
  constructor(
    readonly workerName: string,
    readonly workTime: WorkTime,
    readonly daysOfWork: DaysOfWork,
  ) { }

  static parse(workerName: string, hourlyText: string) {
    if (hourlyText.includes('FÉRIAS')) return;

    const workTime = WorkTime.parse(hourlyText);
    if (!workTime) throw new Error(`Can't parse workTime of "${workerName}"`);

    const daysOfWork = DaysOfWork.parse(hourlyText);
    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${workerName}"!`);

    return new this(workerName, workTime, daysOfWork);
  }
}