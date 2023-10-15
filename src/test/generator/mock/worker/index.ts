import { WorkerInfo } from "../../../../extra-duty-lib";
import { RandomWorkerMock, RandomWorkerMockFactory } from "./random";

export type CreateWorkerMockOptions = RandomWorkerMock;

export class WorkerMocker {
  private _factoryFromOptions(options: CreateWorkerMockOptions) {
    switch (options.mode) {
      case 'random':
        return new RandomWorkerMockFactory(options.config);
    }
  }

  create(options: CreateWorkerMockOptions = { mode: 'random' }): WorkerInfo {
    const factory = this._factoryFromOptions(options);

    return factory.create();
  }

  createArray(size: number, options: CreateWorkerMockOptions = { mode: 'random' }): WorkerInfo[] {
    const factory = this._factoryFromOptions(options);
    const workers: WorkerInfo[] = [];

    for (let i = 0; i < size; i++) {
      const worker = factory.create();

      workers.push(worker);
    }

    return workers;
  }
}