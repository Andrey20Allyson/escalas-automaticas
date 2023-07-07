import { DaysOfWork, WorkTime } from '.';
import { getMonth, parseNumberOrThrow } from "../../utils";

export interface WorkerInfoConfig extends Worker {
  readonly post: string;
  readonly grad: string;
  readonly workerID: number;
  readonly postWorkerID: number;
  readonly individualRegistry: number;
  startPositionsLeft?: number;
}

export interface WorkerParseData {
  name: string;
  post: string;
  grad: string;
  year: number;
  month: number;
  hourly: string;
  registration: string;
  individualRegistry: string;
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

export class WorkerInfo implements Worker, Clonable<WorkerInfo> {
  positionsLeft: number;
  readonly startPositionsLeft: number;

  readonly name: string;
  readonly daysOfWork: DaysOfWork;
  readonly workTime: WorkTime;
  readonly fullWorkerID: number;

  constructor(readonly config: WorkerInfoConfig) {
    this.name = this.config.name;
    this.daysOfWork = this.config.daysOfWork;
    this.workTime = this.config.workTime;

    this.fullWorkerID = WorkerInfo.workerIDToNumber(this.config.workerID, this.config.postWorkerID);

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

  clone() {
    const { daysOfWork, grad, individualRegistry, name, post, postWorkerID, workTime, workerID, startPositionsLeft } = this.config;

    const config: WorkerInfoConfig = {
      daysOfWork: daysOfWork.clone(),
      workTime: workTime.clone(),

      startPositionsLeft,
      individualRegistry,
      postWorkerID,
      workerID,
      grad,
      name,
      post,
    };

    const clone = new WorkerInfo(config);

    clone.positionsLeft = this.positionsLeft;

    return clone;
  }

  static parse(data: WorkerParseData) {
    if (data.hourly.includes('FÉRIAS')) return;

    const workTime = WorkTime.parse(data.hourly);
    if (!workTime) throw new Error(`Can't parse workTime of "${data.name}"`);

    const daysOfWork = DaysOfWork.parse(data.hourly, data.year, data.month);
    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${data.name}"!`);

    const splitedRegistration = data.registration.split('-');
    if (splitedRegistration.length !== 2) throw new Error(`Can't parse registration "${data.registration}"`);

    const [registration, postResistration] = splitedRegistration.map(parseNumberOrThrow);
    
    return new WorkerInfo({
      name: data.name,
      postWorkerID: postResistration,
      workerID: registration,
      grad: data.grad,
      post: data.post,
      workTime,
      daysOfWork,
      individualRegistry: parseNumberOrThrow(data.individualRegistry.replace(/\.|\-/g, '')),
    });
  }

  static fakeFromName(name: string) {
    return new WorkerInfo({
      name,
      post: 'N/A',
      grad: 'N/A',
      workerID: 0,
      postWorkerID: 0,
      individualRegistry: 0,
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

  static createMap(workers: WorkerInfo[]) {
    return new Map(workers.map(this.workerToMapEntry));
  }

  static workerToMapEntry: WorkerToMapEntryCallback = (worker) => {
    return [worker.fullWorkerID, worker];
  };
}