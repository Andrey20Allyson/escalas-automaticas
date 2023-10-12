import { DaysOfWeek, dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import type { ExtraDutyTableConfig } from "../extra-duty-table/v1";
import type { DayOfExtraDuty } from "./day-of-extra-duty";
import { Gender, Graduation, WorkerInfo } from "./worker-info";

export type GraduationQuantityMap = {
  [K in Graduation]: number;
};

export type GenderQuantityMap = {
  [K in Gender]: number;
};

export class ExtraDuty implements Iterable<[string, WorkerInfo]> {
  graduationQuantityMap: GraduationQuantityMap;
  genderQuantityMap: GenderQuantityMap;
  workers: Map<number, WorkerInfo>;

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

    this.graduationQuantityMap = {
      'sub-insp': 0,
      'insp': 0,
      'gcm': 0,
    };

    this.genderQuantityMap = {
      'female': 0,
      'male': 0,
      'N/A': 0,
    };
  }

  gradQuantity(grad: Graduation) {
    return this.graduationQuantityMap[grad];
  }

  genderQuantity(gender: Gender) {
    return this.genderQuantityMap[gender];
  }

  isDailyWorkerAtNight(worker: WorkerInfo) {
    return worker.daysOfWork.isDailyWorker && this.isNightly;
  }

  isWeekDay(weekDay: number) {
    return this.weekDay === weekDay;
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

  breaksInspRule(worker: WorkerInfo) {
    return worker.graduation === 'insp' && this.gradQuantity('insp') > 0;
  }

  breaksGenderRule(worker: WorkerInfo) {
    return worker.gender === 'female' && (this.genderQuantity('female') > 0 && this.genderQuantity('male') < 1);
  }

  *[Symbol.iterator](): Iterator<[string, WorkerInfo]> {
    for (const [_, worker] of this.workers) {
      yield [worker.name, worker];
    }
  }

  isFull() {
    return this.getSize() >= this.config.dutyCapacity;
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
        && !this.breaksInspRule(worker)
        && !this.breaksGenderRule(worker)
      );
  }

  add(worker: WorkerInfo, force = false): boolean {
    if (!this.canAdd(worker, force)) return false;

    this.workers.set(this.keyFrom(worker), worker);

    this.graduationQuantityMap[worker.graduation]++;
    this.genderQuantityMap[worker.gender]++;

    worker.occupyPositions(this.config.dutyPositionSize);

    return true;
  }

  delete(worker: WorkerInfo) {
    const existed = this.workers.delete(this.keyFrom(worker));

    if (!existed) return;

    this.graduationQuantityMap[worker.graduation]--;
    this.genderQuantityMap[worker.gender]--;

    worker.leavePositions(this.config.dutyPositionSize);
  }

  clear() {
    for (const [_, worker] of this) {
      worker.leavePositions(this.config.dutyPositionSize);
    }

    this.workers.clear();

    this._clearQuantityMap();
  }

  private _clearQuantityMap() {
    resetMap(this.genderQuantityMap);
    resetMap(this.graduationQuantityMap);
  }

  static dutiesFrom(day: DayOfExtraDuty): readonly ExtraDuty[] {
    const duties: ExtraDuty[] = new Array(day.size);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(day.day, i, day.config);
    }

    return duties;
  }
}

function resetMap(map: Record<string, number>) {
  for (const key in map) {
    map[key] = 0;
  }
}