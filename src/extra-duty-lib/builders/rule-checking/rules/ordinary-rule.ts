import { DayOfWeek } from "../../../../utils";
import { ExtraDuty, ExtraEventName, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class OrdinaryAssignmentRule implements AssignmentRule {
  private hasntTimeoff(worker: WorkerInfo, duty: ExtraDuty) {
    const { currentPlace } = duty.config;
    
    if (currentPlace === ExtraEventName.JARDIM_BOTANICO_DAYTIME
      || currentPlace === ExtraEventName.SUPPORT_TO_CITY_HALL) {
        return true;
      }
      
      // TODO remove daily worker at extra with out timeoff from ordinary at jiquia
    if (currentPlace === ExtraEventName.JIQUIA && worker.daysOfWork.isDailyWorker) {
      return true;
    }

    return false;
  }

  collidesWithTodayWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workToday = worker.daysOfWork.workOn(duty.day.index);
    if (!workToday) return false;

    const { workTime } = worker;

    if (this.hasntTimeoff(worker, duty)) {
      return duty.end > workTime.start && workTime.end > duty.start;
    }

    return duty.offTimeEnd > workTime.start && workTime.offTimeEnd > duty.start;
  }

  collidesWithYesterdayWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workYesterday = worker.daysOfWork.workOn(duty.day.index - 1);
    if (!workYesterday) return false;

    const { workTime } = worker;

    if (this.hasntTimeoff(worker, duty)) {
      return workTime.end - 24 > duty.start;
    }

    return workTime.offTimeEnd - 24 > duty.start;
  }

  collidesWithTomorrowWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workTomorrow = worker.daysOfWork.workOn(duty.day.index + 1);
    if (!workTomorrow) return false;

    const { workTime } = worker;

    if (this.hasntTimeoff(worker, duty)) {
      return duty.end > workTime.start + 24;
    }

    return duty.offTimeEnd > workTime.start + 24;
  }

  isDailyWorkerAtFridayAtNight(worker: WorkerInfo, duty: ExtraDuty) {
    return worker.daysOfWork.isDailyWorker
      && duty.isWeekDay(DayOfWeek.FRIDAY)
      && duty.isNighttime();
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.isDailyWorkerAtFridayAtNight(worker, duty)) return false;

    return !this.collidesWithTodayWork(worker, duty)
      && !this.collidesWithTomorrowWork(worker, duty)
      && !this.collidesWithYesterdayWork(worker, duty);
  }
}