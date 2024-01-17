import { DaysOfWeek } from "../../../../../utils";
import { DayRestriction, ExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class OrdinaryAssignmentRule implements AssignmentRule {
  collidesWithTodayWork(duty: ExtraDuty, worker: WorkerInfo) {
    const workToday = worker.daysOfWork.workOn(duty.day);
    if (!workToday) return false;

    const workStart = worker.workTime.startTime;

    return duty.offTimeEnd > workStart;
  }

  collidesWithYesterdayWork(duty: ExtraDuty, worker: WorkerInfo) {
    const workYesterday = worker.daysOfWork.workOn(duty.day - 1);
    if (!workYesterday) return false;

    const yesterdayWorkOffTimeEnd = worker.workTime.startTime + worker.workTime.totalTime * 2;

    return yesterdayWorkOffTimeEnd - 24 > duty.start;
  }

  collidesWithTomorrowWork(duty: ExtraDuty, worker: WorkerInfo) {
    const workTomorrow = worker.daysOfWork.workOn(duty.day + 1);
    if (!workTomorrow) return false;

    const tomorrowWorkStart = worker.workTime.startTime + 24;

    return duty.offTimeEnd > tomorrowWorkStart;
  }

  isDailyWorkerAtFridayAtNight(duty: ExtraDuty, worker: WorkerInfo) {
    const isFriday = duty.weekDay === DaysOfWeek.FRIDAY;

    return worker.daysOfWork.isDailyWorker && isFriday && duty.isNightly;
  }

  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    const duty = table
      .getDay(dayIndex)
      .getDuty(dutyIndex);

    if (this.isDailyWorkerAtFridayAtNight(duty, worker)) return false;

    return this.collidesWithTodayWork(duty, worker)
      || this.collidesWithTomorrowWork(duty, worker)
      || this.collidesWithYesterdayWork(duty, worker);
  }

  canAssignInDay(_table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number): boolean {
    return worker.daysOfWork.get(dayIndex) === DayRestriction.ORDINARY_WORK;
  }
}