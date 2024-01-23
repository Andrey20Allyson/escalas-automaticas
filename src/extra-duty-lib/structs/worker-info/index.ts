import { DaysOfWork } from '../days-of-work';
import { Limitable } from "../limitable";
import { WorkLimit } from "../work-limit";
import { WorkTime } from '../work-time';
import { WorkerIdentifier } from '../worker-identifier';

export interface WorkerInfoConfig {
  readonly name: string;
  readonly post: string;
  readonly graduation: Graduation;
  readonly gender: Gender;
  readonly identifier: WorkerIdentifier;
  readonly individualId: number;
  readonly daysOfWork: DaysOfWork;
  readonly workTime: WorkTime;
  limit?: WorkLimit;
}

export interface Clonable<T> {
  clone(): T;
}

export type WorkerToMapEntryCallback = (this: typeof WorkerInfo, worker: WorkerInfo) => [number, WorkerInfo];

export type Graduation = 'sub-insp' | 'insp' | 'gcm';
export type Gender = 'N/A' | 'female' | 'male';

export class WorkerInfo implements Limitable, Clonable<WorkerInfo> {
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

    this.graduation = config.graduation;
    this.gender = config.gender;
    
    this.id = this.identifier.id;
  }

  isGraduate() {
    return this.graduation === 'insp' || this.graduation === 'sub-insp';
  }

  clone() {
    const { daysOfWork, graduation: grad, individualId, name, post, workTime, gender, identifier } = this.config;

    const config: WorkerInfoConfig = {
      daysOfWork: daysOfWork.clone(),
      workTime: workTime.clone(),
      individualId,
      identifier,
      gender,
      graduation: grad,
      name,
      post,
    };

    const clone = new WorkerInfo(config);

    return clone;
  }

  static mapFrom(workers: WorkerInfo[]): Map<number, WorkerInfo> {
    return new Map(workers.map(worker => [worker.id, worker] as const));
  }
}

export * from './parser';

