import { getMonth } from "../../../utils";
import { DaysOfWork } from '../days-of-work';
import { WorkTime } from '../work-time';

export interface WorkerInfoConfig extends Worker {
  readonly post: string;
  readonly grad: string;
  readonly gender: string;
  readonly workerID: number;
  readonly postWorkerID: number;
  readonly individualRegistry: number;
  startPositionsLeft?: number;
}

export interface Worker {
  readonly name: string;
  readonly daysOfWork: DaysOfWork;
  readonly workTime: WorkTime;
}

export interface Clonable<T> {
  clone(): T;
}

export type WorkerToMapEntryCallback = (this: typeof WorkerInfo, worker: WorkerInfo) => [number, WorkerInfo];

export type Graduation = 'sub-insp' | 'insp' | 'gcm';
export type Gender = 'N/A' | 'female' | 'male';

export class WorkerInfo implements Worker, Clonable<WorkerInfo> {
  static readonly genderMap: NodeJS.Dict<Gender> = {
    'F': 'female',
    'M': 'male',
  };

  static readonly graduationMap: NodeJS.Dict<Graduation> = {
    'INSP': 'insp',
    'GCM': 'gcm',
    'SI': 'sub-insp',
  };

  positionsLeft: number;
  readonly startPositionsLeft: number;

  readonly name: string;
  readonly gender: Gender;
  readonly daysOfWork: DaysOfWork;
  readonly graduation: Graduation;
  readonly workTime: WorkTime;
  readonly fullWorkerID: number;

  constructor(readonly config: WorkerInfoConfig) {
    this.name = this.config.name;
    this.daysOfWork = this.config.daysOfWork;
    this.workTime = this.config.workTime;

    this.fullWorkerID = WorkerInfo.workerIDToNumber(this.config.workerID, this.config.postWorkerID);
    this.graduation = WorkerInfo.parseGradutation(config.grad);
    this.gender = WorkerInfo.parseGender(this.config.gender);

    this.startPositionsLeft = this.config.startPositionsLeft ?? 10;
    this.positionsLeft = this.startPositionsLeft;
  }

  resetPositionsLeft() {
    this.positionsLeft = this.startPositionsLeft;
  }

  occupyPositions(num = 1) {
    this.positionsLeft -= num;
  }

  leavePositions(num = 1) {
    this.positionsLeft += num;
  }

  isPositionsLeftEqualsToStart() {
    return this.positionsLeft === this.startPositionsLeft;
  }

  isCompletelyBusy(positions = 1) {
    return this.positionsLeft - positions < 0;
  }

  cantWorkOnExtra() {
    return !this.canWorkOnExtra();
  }

  canWorkOnExtra() {
    return !this.isCompletelyBusy() && this.daysOfWork.getNumOfDaysOff() > 0;
  }

  isGraduate() {
    return this.graduation === 'insp' || this.graduation === 'sub-insp';
  }

  clone() {
    const { daysOfWork, grad, individualRegistry, name, post, postWorkerID, workTime, workerID, startPositionsLeft, gender } = this.config;

    const config: WorkerInfoConfig = {
      daysOfWork: daysOfWork.clone(),
      workTime: workTime.clone(),

      startPositionsLeft,
      individualRegistry,
      postWorkerID,
      workerID,
      gender,
      grad,
      name,
      post,
    };

    const clone = new WorkerInfo(config);

    clone.positionsLeft = this.positionsLeft;

    return clone;
  }

  private static _fakeCount = 0;

  static fakeFromName(name: string) {
    return new WorkerInfo({
      name,
      post: 'N/A',
      grad: 'GCM',
      workerID: WorkerInfo._fakeCount++,
      postWorkerID: 0,
      individualRegistry: 0,
      gender: 'U',
      workTime: new WorkTime(7, 8),
      daysOfWork: DaysOfWork.fromDays([], 2023, getMonth()),
    });
  }

  static parseWorkerID(value: number): [number, number] {
    const id = Math.trunc(value / 10);
    const postID = value - id * 10;

    return [id, postID];
  }

  static workerIDToNumber(id: number, postID: number): number {
    return id * 10 + postID;
  }

  static parseGender(gender?: string): Gender {
    if (!gender) return 'N/A';

    return this.genderMap[gender] ?? 'N/A';
  }

  static parseGradutation(grad: string): Graduation {
    return this.graduationMap[grad] ?? raise(new Error(`Unknow graduation named '${grad}'!`));
  }

  static createMap(workers: WorkerInfo[]) {
    return new Map(workers.map(this.workerToMapEntry));
  }

  static workerToMapEntry: WorkerToMapEntryCallback = (worker) => {
    return [worker.fullWorkerID, worker];
  };
}

function raise(error: unknown): never {
  throw error;
}

export * from './parser';