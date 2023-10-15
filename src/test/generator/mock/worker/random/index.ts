import { MockFactory } from "../..";
import { WorkerInfo } from "../../../../../extra-duty-lib";
import { randomIntFromInterval } from "../../../../../utils";
import { randomDaysOfWork } from "./days-of-work";
import { randomGender } from "./gender";
import { randomGrad } from "./grad";
import { randomName } from "./name";
import { randomWorkTime } from "./work-time";

export type RandomWorkerMock = {
  mode: 'random';
  config?: RandomWorkerMockFactoryConfig;
}

export interface RandomWorkerMockFactoryConfig {
  month?: number;
  year?: number;
}

export class RandomWorkerMockFactory implements MockFactory<WorkerInfo> {
  constructor(readonly config: RandomWorkerMockFactoryConfig = {}) { }

  create(): WorkerInfo {
    const {
      month,
      year,
    } = this.config;

    const gender = randomGender();
    const name = randomName(gender);
    const grad = randomGrad();
    const daysOfWork = randomDaysOfWork({ month, year });
    const workTime = randomWorkTime(daysOfWork.isDailyWorker);

    const worker = new WorkerInfo({
      name,
      grad,
      daysOfWork,
      gender: gender === 'female' ? 'F' : 'M',
      post: 'BRIGADA AMBIENTAL',
      workerID: randomIntFromInterval(0, 999_999),
      postWorkerID: randomIntFromInterval(0, 9),
      individualRegistry: randomIntFromInterval(0, 99_999_999_999),
      workTime,
    });

    return worker;
  }
}