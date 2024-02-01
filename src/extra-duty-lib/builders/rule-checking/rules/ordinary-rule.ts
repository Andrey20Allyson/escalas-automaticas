import { DaysOfWeek } from "../../../../utils";
import { ExtraDuty, ExtraPlace, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class OrdinaryAssignmentRule implements AssignmentRule {
  collidesWithTodayWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workToday = worker.daysOfWork.workOn(duty.day.index);
    if (!workToday) return false;

    const workStart = worker.workTime.startTime;

    return duty.offTimeEnd > workStart;
  }

  collidesWithYesterdayWork(worker: WorkerInfo, duty: ExtraDuty) {
    if (duty.config.currentPlace === ExtraPlace.JARDIM_BOTANICO) return false;
    
    const workYesterday = worker.daysOfWork.workOn(duty.day.index - 1);
    if (!workYesterday) return false;

    const yesterdayWorkOffTimeEnd = worker.workTime.startTime + worker.workTime.totalTime * 2;

    return yesterdayWorkOffTimeEnd - 24 > duty.start;
  }

  collidesWithTomorrowWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workTomorrow = worker.daysOfWork.workOn(duty.day.index + 1);
    if (!workTomorrow) return false;

    const tomorrowWorkStart = worker.workTime.startTime + 24;

    return duty.offTimeEnd > tomorrowWorkStart;
  }

  isDailyWorkerAtFridayAtNight(worker: WorkerInfo, duty: ExtraDuty) {
    const isFriday = duty.weekDay === DaysOfWeek.FRIDAY;

    return worker.daysOfWork.isDailyWorker && isFriday && duty.isNighttime();
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.isDailyWorkerAtFridayAtNight(worker, duty)) return false;

    return !this.collidesWithTodayWork(worker, duty)
      && !this.collidesWithTomorrowWork(worker, duty)
      && !this.collidesWithYesterdayWork(worker, duty);
  }
}