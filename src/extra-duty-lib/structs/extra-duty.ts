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
  readonly start: number;
  readonly end: number;

  constructor(
    readonly day: number,
    readonly index: number,
    readonly config: ExtraDutyTableConfig
  ) {
    this.workers = new Map();

    this.start = config.firstDutyTime + config.dutyInterval * index;
    this.end = this.start + this.config.dutyDuration;
    this.offTimeEnd = this.end + this.config.dutyDuration;

    this.graduationQuantityMap = {
      [Graduation.INSP]: 0,
      [Graduation.GCM]: 0,
      [Graduation.SI]: 0,
    };

    this.genderQuantityMap = {
      [Gender.UNDEFINED]: 0,
      [Gender.FEMALE]: 0,
      [Gender.MALE]: 0,
    };
  }

  gradQuantity(grad: Graduation) {
    return this.graduationQuantityMap[grad];
  }

  genderQuantity(gender: Gender) {
    return this.genderQuantityMap[gender];
  }

  collidesWithWork(worker: WorkerInfo) {
    // TODO add feature: daily workers can work at extra in same day of ordinary work, but just at night.

    return this.collidesWithTodayWork(worker)
      || this.collidesWithYesterdayWork(worker)
      || this.collidesWithTommorowWork(worker);
  }

  collidesWithTodayWork(worker: WorkerInfo) {
    const workToday = worker.daysOfWork.workOn(this.day);
    if (!workToday) return false;

    const workStart = worker.workTime.startTime;

    return this.offTimeEnd > workStart;
  }

  collidesWithTommorowWork(worker: WorkerInfo) {
    const workYesterday = worker.daysOfWork.workOn(this.day - 1);
    if (!workYesterday) return false;

    const yesterdayWorkOffTimeEnd = worker.workTime.startTime + worker.workTime.totalTime * 2;

    return yesterdayWorkOffTimeEnd - 24 > this.start;
  }

  collidesWithYesterdayWork(worker: WorkerInfo) {
    const workTomorrow = worker.daysOfWork.workOn(this.day + 1);
    if (!workTomorrow) return false;

    const tomorrowWorkStart = worker.workTime.startTime + 24;

    return this.offTimeEnd > tomorrowWorkStart;
  }

  breaksInspRule(worker: WorkerInfo) {
    return worker.graduation === Graduation.INSP && this.gradQuantity(Graduation.INSP) > 0;
  }

  breaksGenderRule(worker: WorkerInfo) {
    return worker.gender === Gender.FEMALE && this.genderQuantity(Gender.FEMALE) > 0;
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
    this.genderQuantityMap[Gender.UNDEFINED] = 0;
    this.genderQuantityMap[Gender.FEMALE] = 0;
    this.genderQuantityMap[Gender.MALE] = 0;
  
    this.graduationQuantityMap[Graduation.INSP] = 0;
    this.graduationQuantityMap[Graduation.GCM] = 0;
    this.graduationQuantityMap[Graduation.SI] = 0;  
  }

  static dutiesFrom(day: DayOfExtraDuty): readonly ExtraDuty[] {
    const duties: ExtraDuty[] = new Array(day.size);

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(day.day, i, day.config);
    }

    return duties;
  }
}