import { DayOfWeek } from "../../../../utils";
import { ExtraDuty, ExtraEventName, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class OrdinaryAssignmentRule implements AssignmentRule {
  private hasExtraFollowedByAOrdinary(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { day } = duty;
    const { workTime, daysOfWork } = worker;

    let unitedCount = 0;

    if (daysOfWork.workOn(day.index - 1) && workTime.end - 24 - duty.start !== 0) {
      unitedCount++;
    }

    if (daysOfWork.workOn(day.index) && workTime.end - duty.start !== 0) {
      unitedCount++;
    }

    if (unitedCount === 0) return false;

    const dutyBeforeOrdinary = day.table.findDuty(
      otherDuty => {
        if (otherDuty.has(worker) === false) return false;

        if (daysOfWork.workOn(otherDuty.day.index)) {
          if (otherDuty.end - workTime.start === 0) return true;
        }

        if (daysOfWork.workOn(otherDuty.day.index + 1)) {
          if (otherDuty.end - 24 - workTime.start === 0) return true;
        }

        return false;
      },
      duty.day.index - 1,
      duty.day.index + 1,
    );

    return dutyBeforeOrdinary !== undefined;
  }

  private hasOrdinaryFollowedByAExtra(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { day } = duty;
    const { workTime, daysOfWork } = worker;

    let unitedCount = 0;

    if (daysOfWork.workOn(day.index + 1) && workTime.start + 24 - duty.end !== 0) {
      unitedCount++;
    }

    if (daysOfWork.workOn(day.index) && workTime.start - duty.end !== 0) {
      unitedCount++;
    }

    if (unitedCount === 0) return false;

    const dutyBeforeOrdinary = day.table.findDuty(
      otherDuty => {
        if (otherDuty.has(worker) === false) return false;

        if (daysOfWork.workOn(otherDuty.day.index)) {
          if (workTime.end - otherDuty.start === 0) return true;
        }

        if (daysOfWork.workOn(otherDuty.day.index - 1)) {
          if (workTime.end - otherDuty.start + 24 === 0) return true;
        }

        return false;
      },
      duty.day.index,
      duty.day.index + 2,
    );

    return dutyBeforeOrdinary !== undefined;
  }

  private hasOrdinaryAfter(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { day } = duty;
    const { daysOfWork } = worker;
    const workTodayOrYesternay = daysOfWork.workOn(day.index)
      || daysOfWork.workOn(day.index + 1);

    return workTodayOrYesternay;
  }

  private hasOrdinaryBefore(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { day } = duty;
    const { daysOfWork } = worker;
    const workTodayOrYesternay = daysOfWork.workOn(day.index)
      || daysOfWork.workOn(day.index - 1);

    return workTodayOrYesternay;
  }

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

    if (this.hasntTimeoff(worker, duty)
      && this.hasOrdinaryAfter(worker, duty) === false
      && this.hasOrdinaryBefore(worker, duty) === false
    ) {
      return duty.end > workTime.start && workTime.end > duty.start;
    }

    return duty.offTimeEnd > workTime.start && workTime.offTimeEnd > duty.start;
  }

  collidesWithYesterdayWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workYesterday = worker.daysOfWork.workOn(duty.day.index - 1);
    if (!workYesterday) return false;

    const { workTime } = worker;

    if (this.hasntTimeoff(worker, duty)
      && this.hasOrdinaryAfter(worker, duty) === false
      && this.hasExtraFollowedByAOrdinary(worker, duty)
    ) {
      return workTime.end - 24 > duty.start;
    }

    return workTime.offTimeEnd - 24 > duty.start;
  }

  collidesWithTomorrowWork(worker: WorkerInfo, duty: ExtraDuty) {
    const workTomorrow = worker.daysOfWork.workOn(duty.day.index + 1);
    if (!workTomorrow) return false;

    const { workTime } = worker;

    if (this.hasntTimeoff(worker, duty)
      && this.hasOrdinaryBefore(worker, duty) === false
      && this.hasOrdinaryFollowedByAExtra(worker, duty) === false
    ) {
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