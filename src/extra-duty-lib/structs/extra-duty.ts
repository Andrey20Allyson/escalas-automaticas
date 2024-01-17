import { dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import type { DayOfExtraDuty } from "./day-of-extra-duty";
import type { ExtraDutyTable, ExtraDutyTableConfig } from "./extra-duty-table";
import { Gender, Graduation, WorkerInfo } from "./worker-info";
import { WorkingPlaceStorage } from "./working-place-storage";

export class ExtraDuty implements Iterable<[string, WorkerInfo]> {
  readonly offTimeEnd: number;
  readonly isNightly: boolean;
  readonly start: number;
  readonly end: number;
  readonly firstMonday: number;
  readonly weekDay: number;
  readonly workers: WorkingPlaceStorage;
  readonly config: ExtraDutyTableConfig;
  readonly table: ExtraDutyTable;

  constructor(
    readonly index: number,
    readonly day: DayOfExtraDuty,
  ) {
    this.table = day.table;
    this.config = day.config;

    this.workers = new WorkingPlaceStorage();

    this.start = this.config.firstDutyTime + this.config.dutyInterval * index;
    this.end = this.start + this.config.dutyDuration;
    this.offTimeEnd = this.end + this.config.dutyDuration;
    this.isNightly = this.start >= 18 || this.start < 7;
    this.firstMonday = firstMondayFromYearAndMonth(this.config.year, this.config.month);
    this.weekDay = dayOfWeekFrom(this.firstMonday, this.day.index);
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

  add(worker: WorkerInfo) {
    this.workers.add(this.config.currentPlace, worker);

    worker.occupyPositions(this.config.dutyPositionSize);
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
    const duties: ExtraDuty[] = new Array(day.getSize());

    for (let i = 0; i < duties.length; i++) {
      duties[i] = new ExtraDuty(i, day);
    }

    return duties;
  }
}