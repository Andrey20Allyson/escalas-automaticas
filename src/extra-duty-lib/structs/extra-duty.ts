import { DaysOfWeek, dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import type { ExtraDutyTableConfig } from "../extra-duty-table/extra-duty-table";
import type { DayOfExtraDuty } from "./day-of-extra-duty";
import { Gender, Graduation, WorkerInfo } from "./worker-info";
import { WorkingPlaceStorage } from "./working-place-storage";

export class ExtraDuty implements Iterable<[string, WorkerInfo]> {
  workers: WorkingPlaceStorage;

  readonly offTimeEnd: number;
  readonly isNightly: boolean;
  readonly start: number;
  readonly end: number;
  readonly firstMonday: number;
  readonly weekDay: number;

  constructor(
    readonly day: number,
    readonly index: number,
    readonly config: ExtraDutyTableConfig
  ) {
    this.workers = new WorkingPlaceStorage();

    this.start = config.firstDutyTime + config.dutyInterval * index;
    this.end = this.start + this.config.dutyDuration;
    this.offTimeEnd = this.end + this.config.dutyDuration;
    this.isNightly = this.start >= 18 || this.start < 7;
    this.firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);
    this.weekDay = dayOfWeekFrom(this.firstMonday, this.day);
  }

  copy(other: ExtraDuty): this {
    this.workers.copy(other.workers);

    return this;
  }

  gradQuantity(grad: Graduation): number {
    return this.workers.graduation.quantityFrom(this.config.currentPlace, grad);
  }

  graduateQuantity() {
    return this.gradQuantity('insp') + this.gradQuantity('sub-insp');
  }

  genderQuantity(gender: Gender): number {
    return this.workers.gender.quantityFrom(this.config.currentPlace, gender);
  }

  isDailyWorkerAtNight(worker: WorkerInfo) {
    return worker.daysOfWork.isDailyWorker && this.isNightly;
  }

  gradIsOnly(grad: Graduation) {
    return !this.isEmpity() && this.gradQuantity(grad) === this.getSize();
  }

  genderIsOnly(gender: Gender) {
    return !this.isEmpity() && this.genderQuantity(gender) === this.getSize();
  }

  isWeekDay(weekDay: number) {
    return this.weekDay === weekDay;
  }

  isWorkerInsuficient() {
    return this.getSize() < 2;
  }

  isDailyWorkerAtFridayAtNight(worker: WorkerInfo) {
    const isFriday = this.isWeekDay(DaysOfWeek.FRIDAY);

    return isFriday && this.isDailyWorkerAtNight(worker);
  }

  collidesWithWork(worker: WorkerInfo) {
    if (this.isDailyWorkerAtFridayAtNight(worker)) return false;

    return this.collidesWithTodayWork(worker)
      || this.collidesWithTomorrowWork(worker)
      || this.collidesWithYesterdayWork(worker);
  }

  collidesWithTodayWork(worker: WorkerInfo) {
    const workToday = worker.daysOfWork.workOn(this.day);
    if (!workToday) return false;

    const workStart = worker.workTime.startTime;

    return this.offTimeEnd > workStart;
  }

  collidesWithYesterdayWork(worker: WorkerInfo) {
    const workYesterday = worker.daysOfWork.workOn(this.day - 1);
    if (!workYesterday) return false;

    const yesterdayWorkOffTimeEnd = worker.workTime.startTime + worker.workTime.totalTime * 2;

    return yesterdayWorkOffTimeEnd - 24 > this.start;
  }

  collidesWithTomorrowWork(worker: WorkerInfo) {
    const workTomorrow = worker.daysOfWork.workOn(this.day + 1);
    if (!workTomorrow) return false;

    const tomorrowWorkStart = worker.workTime.startTime + 24;

    return this.offTimeEnd > tomorrowWorkStart;
  }

  collidesWithLicense(worker: WorkerInfo) {
    return worker.daysOfWork.licenseOn(this.day);
  }

  breaksInspRule(worker: WorkerInfo) {
    return worker.graduation === 'insp' && this.gradQuantity('insp') > 0;
  }

  breaksGenderRule(worker: WorkerInfo) {
    return worker.gender === 'female' && (this.genderQuantity('female') > 0 && this.genderQuantity('male') < 1);
  }

  *[Symbol.iterator](): Iterator<[string, WorkerInfo]> {
    for (const [_, worker] of this.workers.placeFrom(this.config.currentPlace)) {
      yield [worker.name, worker];
    }
  }

  isFull() {
    return this.getSize() >= this.config.dutyCapacity;
  }

  isEmpity() {
    return this.getSize() === 0;
  }

  has(worker: WorkerInfo, place?: string) {
    return this.workers.has(worker, place);
  }

  keyFrom(worker: WorkerInfo) {
    return worker.fullWorkerID;
  }

  getSize(): number {
    return this.workers.placeFrom(this.config.currentPlace).size;
  }

  canAdd(worker: WorkerInfo, force = false) {
    return !this.has(worker)
      && (force
        || !worker.isCompletelyBusy(this.config.dutyPositionSize)
        && !this.isFull()
        && !this.collidesWithLicense(worker)
        && !this.breaksInspRule(worker)
        && !this.breaksGenderRule(worker)
      );
  }

  add(worker: WorkerInfo, force = false): boolean {
    if (!this.canAdd(worker, force)) return false;

    this.workers.add(this.config.currentPlace, worker);

    worker.occupyPositions(this.config.dutyPositionSize);

    return true;
  }

  delete(worker: WorkerInfo) {
    const existed = this.workers.remove(this.config.currentPlace, worker);

    if (!existed) return;

    worker.leavePositions(this.config.dutyPositionSize);
  }

  clear() {
    for (const [_, worker] of this) {
      worker.leavePositions(this.config.dutyPositionSize);
    }

    this.workers.clear();
  }

  static dutiesFrom(day: DayOfExtraDuty): readonly ExtraDuty[] {
    const duties: ExtraDuty[] = new Array(day.size);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(day.day, i, day.config);
    }

    return duties;
  }
}