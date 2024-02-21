import { MockFactory } from "../..";
import { ExtraEventName, WorkLimit, WorkerInfo } from "../../../../../extra-duty-lib";
import { WorkerIdentifier } from "../../../../../extra-duty-lib/structs/worker-identifier";
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

export class RandomWorkerMockFactory extends MockFactory<WorkerInfo> {
  constructor(readonly config: RandomWorkerMockFactoryConfig = {}) {
    super();
  }

  create(): WorkerInfo {
    const {
      month,
      year,
    } = this.config;

    const gender = randomGender();
    const name = randomName(gender);
    const graduation = randomGrad();
    const daysOfWork = randomDaysOfWork({ month, year });
    const workTime = randomWorkTime(daysOfWork.isDailyWorker);
    const identifier = new WorkerIdentifier(
      randomIntFromInterval(0, 999_999),
      randomIntFromInterval(0, 9),
    );

    let limit = new WorkLimit([{
      limit: 0,
      place: ExtraEventName.SUPPORT_TO_CITY_HALL,
    }, {
      limit: 0,
      place: ExtraEventName.JARDIM_BOTANICO_DAYTIME,
    }]);

    if (Math.random() > .55) {
      const limits = [6, 2];
      if (Math.random() > .5) limits.reverse();

      limit = new WorkLimit([
        ...limit.iter(),
        {
          limit: limits[0],
          place: ExtraEventName.SUPPORT_TO_CITY_HALL,
        }, {
          limit: limits[1],
          place: ExtraEventName.JARDIM_BOTANICO_DAYTIME,
        }
      ]);
    }

    const worker = new WorkerInfo({
      name,
      graduation,
      daysOfWork,
      gender,
      post: 'BRIGADA AMBIENTAL',
      identifier,
      individualId: randomIntFromInterval(0, 99_999_999_999),
      workTime,
      limit,
    });

    return worker;
  }
}