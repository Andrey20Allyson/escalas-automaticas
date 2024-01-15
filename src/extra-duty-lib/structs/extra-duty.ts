import { DaysOfWeek, dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import type { ExtraDutyTableConfig } from "../extra-duty-table/extra-duty-table";
import type { DayOfExtraDuty } from "./day-of-extra-duty";
import { QuantityStorage } from "./quantity-storage";
import { Gender, Graduation, WorkerInfo } from "./worker-info";

export interface ExtraDutyEntry {
  readonly place: string;
  readonly worker: WorkerInfo;
}

export class WorkingPlaceStorage {
  private places: Map<string, Map<number, WorkerInfo>>;
  readonly gender: QuantityStorage<Gender>;
  readonly graduation: QuantityStorage<Graduation>;

  constructor() {
    this.places = new Map();

    this.graduation = new QuantityStorage<Graduation>(() => ({
      'sub-insp': 0,
      'insp': 0,
      'gcm': 0,
    }));

    this.gender = new QuantityStorage<Gender>(() => ({
      'female': 0,
      'male': 0,
      'N/A': 0,
    }));
  }

  placeFrom(name: string): Map<number, WorkerInfo> {
    let place = this.places.get(name);

    if (place === undefined) {
      place = new Map();

      this.places.set(name, place);
    }

    return place;
  }

  has(workerId: number): boolean;
  has(worker: WorkerInfo): boolean;
  has(arg0: number | WorkerInfo): boolean {
    const id = typeof arg0 === 'number' ? arg0 : this.keyFrom(arg0);

    for (const [_, place] of this.places) {
      if (place.has(id)) return true;
    }

    return false;
  }

  add(place: string, worker: WorkerInfo): void {
    this.placeFrom(place).set(this.keyFrom(worker), worker);

    this.graduation.increment(place, worker.graduation);
    this.gender.increment(place, worker.gender);
  }

  remove(place: string, worker: WorkerInfo): boolean {
    const existed = this.placeFrom(place).delete(this.keyFrom(worker));

    if (!existed) return false;

    this.graduation.decrement(place, worker.graduation);
    this.gender.decrement(place, worker.gender);

    return true;
  }

  copy(storage: WorkingPlaceStorage): this {
    this.clear();

    this.gender.copy(storage.gender);
    this.graduation.copy(storage.graduation);

    for (const [name, place] of storage.places) {
      this.places.set(name, new Map(place));
    }

    return this;
  }

  keyFrom(worker: WorkerInfo): number {
    return worker.fullWorkerID;
  }

  clear(): void {
    this.places.clear();
    this.gender.clear();
    this.graduation.clear();
  }
}

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

  has(worker: WorkerInfo) {
    return this.workers.has(worker);
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