import { test, expect, describe } from 'vitest';
import { ExtraDuty } from './extra-duty';
import { WorkerInfo } from './worker-info';
import { DaysOfWork } from './days-of-work';
import { WorkTime } from './work-time';

interface DutyMockConfig {
  day: number;
  index: number;
  year?: number;
}

interface WorkerMockConfig {
  isDailyWorker: boolean;
}

interface MocksConfig {
  duty: DutyMockConfig;
  worker: WorkerMockConfig;
}

function mocks(config: MocksConfig) {
  const mockedYear = 2023;
  const mockedMonth = 9;

  const duty = new ExtraDuty(config.duty.day, config.duty.index, {
    dutyCapacity: 1,
    dutyDuration: 12,
    dutyInterval: 12,
    dutyMinDistance: 4,
    dutyPositionSize: 2,
    firstDutyTime: 7,
    month: mockedMonth,
    year: mockedYear,
  });

  const daysOfWork = config.worker.isDailyWorker
    ? DaysOfWork.fromDailyWorker(mockedYear, mockedMonth)
    : DaysOfWork.fromDays([0, 1, 4, 5, 7, 8, 20, 21, 22, 26, 27], mockedYear, mockedMonth);

  const worker = new WorkerInfo({
    daysOfWork,
    gender: 'M',
    grad: 'GCM',
    individualRegistry: 0,
    name: 'John Due',
    post: 'N/A',
    postWorkerID: 0,
    workerID: 0,
    workTime: new WorkTime(7, 12),
  });

  return { duty, worker };
}

function createIsDailyWorkerAtFridayAtNightTest(nameSufix: string, mockConfig: MocksConfig, expectedReturn: boolean) {
  test(`#${ExtraDuty.prototype.isDailyWorkerAtFridayAtNight.name} shold return ${expectedReturn} if ${nameSufix}`, () => {
    const { duty, worker } = mocks(mockConfig);

    expect(duty.isDailyWorkerAtFridayAtNight(worker)).toEqual(expectedReturn);
  });
}

describe(WorkTime.name, () => {
  createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday night and worker is a daily worker`, {
    duty: {
      day: 5,
      index: 1,
    },
    worker: {
      isDailyWorker: true
    }
  }, true);

  createIsDailyWorkerAtFridayAtNightTest(`extra duty isn't at friday`, {
    duty: {
      day: 4,
      index: 1,
    },
    worker: {
      isDailyWorker: true
    }
  }, false);

  createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday but isn't at night`, {
    duty: {
      day: 5,
      index: 0,
    },
    worker: {
      isDailyWorker: true
    }
  }, false);

  createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday and is at night bot worker isn't a daily worker`, {
    duty: {
      day: 5,
      index: 0,
    },
    worker: {
      isDailyWorker: false,
    }
  }, false);
})