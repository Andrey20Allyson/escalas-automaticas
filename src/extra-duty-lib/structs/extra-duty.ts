import { DaysOfWeek, dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import type { ExtraDutyTableConfig } from "../extra-duty-table/extra-duty-table";
import type { DayOfExtraDuty } from "./day-of-extra-duty";
import { QuantityStorage } from "./quantity-storage";
import { Gender, Graduation, WorkerInfo } from "./worker-info";

export type GraduationQuantityMap = {
  [K in Graduation]: number;
};

export type GenderQuantityMap = {
  [K in Gender]: number;
};

export interface ExtraDutyEntry {
  readonly place: string;
  readonly worker: WorkerInfo;
}

export class ExtraDuty implements Iterable<[string, WorkerInfo]> {
  graduationQuantityStorage: QuantityStorage<Graduation>;
  genderQuantityStorage: QuantityStorage<Gender>;
  workers: Map<number, ExtraDutyEntry>;

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
    this.workers = new Map();

    this.start = config.firstDutyTime + config.dutyInterval * index;
    this.end = this.start + this.config.dutyDuration;
    this.offTimeEnd = this.end + this.config.dutyDuration;
    this.isNightly = this.start >= 18 || this.start < 7;
    this.firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);
    this.weekDay = dayOfWeekFrom(this.firstMonday, this.day);

    this.graduationQuantityStorage = new QuantityStorage<Graduation>(() => ({
      'sub-insp': 0,
      'insp': 0,
      'gcm': 0,
    }));

    this.genderQuantityStorage = new QuantityStorage<Gender>(() => ({
      'female': 0,
      'male': 0,
      'N/A': 0,
    }));
  }

  *entries(): Iterable<[number, ExtraDutyEntry]> {
    for (const entry of this.workers) {
      yield entry;
    }
  }

  copy(other: ExtraDuty): this {
    this.graduationQuantityStorage.copy(other.graduationQuantityStorage);
    this.genderQuantityStorage.copy(other.genderQuantityStorage);

    this.workers.clear();

    for (const [_, entry] of other.entries()) {
      this.workers.set(this.keyFrom(entry.worker), entry);
    }

    return this;
  }

  gradQuantity(grad: Graduation): number {
    return this.graduationQuantityStorage.quantityFrom(this.config.currentPlace, grad);
  }

  graduateQuantity() {
    return this.gradQuantity('insp') + this.gradQuantity('sub-insp');
  }

  genderQuantity(gender: Gender): number {
    return this.genderQuantityStorage.quantityFrom(this.config.currentPlace, gender);
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
    for (const [_, entry] of this.workers) {
      yield [entry.worker.name, entry.worker];
    }
  }

  isFull() {
    return this.getSize() >= this.config.dutyCapacity;
  }

  isEmpity() {
    return this.getSize() === 0;
  }

  has(worker: WorkerInfo) {
    return this.workers.has(this.keyFrom(worker));
  }

  keyFrom(worker: WorkerInfo) {
    return worker.fullWorkerID;
  }

  getSize() {
    return this.workers.size;
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

    this.workers.set(this.keyFrom(worker), { place: this.config.currentPlace, worker });

    this.graduationQuantityStorage.increment(this.config.currentPlace, worker.graduation);
    this.genderQuantityStorage.increment(this.config.currentPlace, worker.gender);

    worker.occupyPositions(this.config.dutyPositionSize);

    return true;
  }

  delete(worker: WorkerInfo) {
    const existed = this.workers.delete(this.keyFrom(worker));

    if (!existed) return;

    this.graduationQuantityStorage.decrement(this.config.currentPlace, worker.graduation);
    this.genderQuantityStorage.decrement(this.config.currentPlace, worker.gender);

    worker.leavePositions(this.config.dutyPositionSize);
  }

  clear() {
    for (const [_, worker] of this) {
      worker.leavePositions(this.config.dutyPositionSize);
    }

    this.workers.clear();
    this.genderQuantityStorage.clear();
    this.graduationQuantityStorage.clear();
  }

  static dutiesFrom(day: DayOfExtraDuty): readonly ExtraDuty[] {
    const duties: ExtraDuty[] = new Array(day.size);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(day.day, i, day.config);
    }

    return duties;
  }
}