import { test, expect, describe } from 'vitest';
import { ExtraDuty } from '../../extra-duty-lib/structs/extra-duty';
import { WorkerInfo } from '../../extra-duty-lib/structs/worker-info';
import { DaysOfWork } from '../../extra-duty-lib/structs/days-of-work';
import { WorkTime } from '../../extra-duty-lib/structs/work-time';

interface DutyMockConfig {
  day: number;
  index: number;
  year?: number;
}

interface WorkerMockConfig {
  daysOfWork: 'daily-worker' | number[];
  workTime?: WorkTime;
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

  const daysOfWork = config.worker.daysOfWork === 'daily-worker'
    ? DaysOfWork.fromDailyWorker(mockedYear, mockedMonth)
    : DaysOfWork.fromDays(config.worker.daysOfWork, mockedYear, mockedMonth);

  const worker = new WorkerInfo({
    daysOfWork,
    gender: 'M',
    grad: 'GCM',
    individualRegistry: 0,
    name: 'John Due',
    post: 'N/A',
    postWorkerID: 0,
    workerID: 0,
    workTime: config.worker.workTime ?? new WorkTime(7, 12),
  });

  return { duty, worker };
}

function createIsDailyWorkerAtFridayAtNightTest(nameSufix: string, mockConfig: MocksConfig, expectedReturn: boolean) {
  test(`shold return ${expectedReturn} if ${nameSufix}`, () => {
    const { duty, worker } = mocks(mockConfig);

    expect(duty.isDailyWorkerAtFridayAtNight(worker)).toEqual(expectedReturn);
  });
}

describe(ExtraDuty.name, () => {
  describe(ExtraDuty.prototype.isDailyWorkerAtFridayAtNight.name, () => {
    createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday night and worker is a daily worker`, {
      duty: {
        day: 5,
        index: 1,
      },
      worker: {
        daysOfWork: 'daily-worker'
      }
    }, true);

    createIsDailyWorkerAtFridayAtNightTest(`extra duty isn't at friday`, {
      duty: {
        day: 4,
        index: 1,
      },
      worker: {
        daysOfWork: 'daily-worker'
      }
    }, false);

    createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday but isn't at night`, {
      duty: {
        day: 5,
        index: 0,
      },
      worker: {
        daysOfWork: 'daily-worker'
      }
    }, false);

    createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday and is at night bot worker isn't a daily worker`, {
      duty: {
        day: 5,
        index: 0,
      },
      worker: {
        daysOfWork: [],
      }
    }, false);
  });

  describe(ExtraDuty.prototype.collidesWithTomorrowWork.name, () => {
    test(`shold return true if duty collides with tomorrow work time off`, () => {
      const { duty, worker } = mocks({
        duty: {
          day: 7,
          index: 1,
        },
        worker: {
          daysOfWork: [8],
          workTime: new WorkTime(7, 12),
        },
      });

      expect(duty.collidesWithTomorrowWork(worker)).toBeTruthy();
    });
  });
});