import { DaysOfWork } from '../days-of-work';
import { Limitable } from "../limitable";
import { WorkLimit } from "../work-limit";
import { WorkTime } from '../work-time';
import { WorkerIdentifier } from '../worker-identifier';

export interface WorkerInfoConfig extends Worker {
  readonly post: string;
  readonly grad: string;
  readonly gender: string;
  readonly identifier: WorkerIdentifier;
  readonly individualId: number;
  limit?: WorkLimit;
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

export class WorkerInfo implements Limitable, Worker, Clonable<WorkerInfo> {
  static readonly genderMap: NodeJS.Dict<Gender> = {
    'F': 'female',
    'M': 'male',
  };

  static readonly graduationMap: NodeJS.Dict<Graduation> = {
    'INSP': 'insp',
    'GCM': 'gcm',
    'SI': 'sub-insp',
  };

  readonly id: number;
  readonly limit: WorkLimit;
  readonly identifier: WorkerIdentifier;
  readonly name: string;
  readonly gender: Gender;
  readonly daysOfWork: DaysOfWork;
  readonly graduation: Graduation;
  readonly workTime: WorkTime;

  constructor(readonly config: WorkerInfoConfig) {
    this.identifier = config.identifier;
    this.name = this.config.name;
    this.daysOfWork = this.config.daysOfWork;
    this.workTime = this.config.workTime;
    this.limit = config.limit ?? new WorkLimit();

    this.graduation = WorkerInfo.parseGradutation(config.grad);
    this.gender = WorkerInfo.parseGender(this.config.gender);
    this.id = this.identifier.id;
  }

  isGraduate() {
    return this.graduation === 'insp' || this.graduation === 'sub-insp';
  }

  clone() {
    const { daysOfWork, grad, individualId, name, post, workTime, gender, identifier } = this.config;

    const config: WorkerInfoConfig = {
      daysOfWork: daysOfWork.clone(),
      workTime: workTime.clone(),
      individualId,
      identifier,
      gender,
      grad,
      name,
      post,
    };

    const clone = new WorkerInfo(config);

    return clone;
  }

  static parseWorkerID(value: number): [number, number] {
    const id = Math.trunc(value / 10);
    const postID = value - id * 10;

    return [id, postID];
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
    return [worker.id, worker];
  };
}

function raise(error: unknown): never {
  throw error;
}

export * from './parser';
