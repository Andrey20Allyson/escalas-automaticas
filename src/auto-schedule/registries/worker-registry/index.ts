import { Gender } from "../../../extra-duty-lib";

export type WorkerRegistryGender = 'F' | 'M';

export class WorkerRegistry {
  constructor(
    readonly workerId: string,
    readonly name: string,
    readonly gender: WorkerRegistryGender,
    readonly individualId: string,
  ) { }
}