import { test, expect, describe } from 'vitest';
import { ExtraDuty } from '../../extra-duty-lib/structs/extra-duty';
import { WorkerInfo } from '../../extra-duty-lib/structs/worker-info';
import { DaysOfWork } from '../../extra-duty-lib/structs/days-of-work';
import { WorkTime } from '../../extra-duty-lib/structs/work-time';
import { LicenseInterval } from '../../extra-duty-lib/structs/days-of-work/license-interval';
import { Day } from '../../extra-duty-lib/structs/day';

interface DutyMockConfig {
  day: number;
  index: number;
  year?: number;
  month?: number;
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
  // const {
  //   duty: {
  //     year = 2023,
  //     month = 9,
  //   }
  // } = config;

  // const duty = new ExtraDuty(config.duty.day, config.duty.index, {
  //   currentPlace: 'n/a',
  //   maxAcceptablePenalityAcc: 0,
  //   dutyCapacity: 1,
  //   dutyDuration: 12,
  //   dutyInterval: 12,
  //   dutyMinDistance: 4,
  //   dutyPositionSize: 2,
  //   firstDutyTime: 7,
  //   month,
  //   year,
  // });

  // const daysOfWork = config.worker.daysOfWork === 'daily-worker'
  //   ? DaysOfWork.fromDailyWorker(year, month)
  //   : DaysOfWork.fromDays(config.worker.daysOfWork, year, month);

  // const worker = new WorkerInfo({
  //   daysOfWork,
  //   gender: 'M',
  //   grad: 'GCM',
  //   individualRegistry: 0,
  //   name: 'John Due',
  //   post: 'N/A',
  //   postWorkerID: 0,
  //   workerID: 0,
  //   workTime: config.worker.workTime ?? new WorkTime(7, 12),
  // });

  // return { duty, worker };
}

function createIsDailyWorkerAtFridayAtNightTest(nameSufix: string, mockConfig: MocksConfig, expectedReturn: boolean) {
  test(`shold return ${expectedReturn} if ${nameSufix}`, () => {
    // TODO remake a rule checker test
    // const { duty, worker } = mocks(mockConfig);

    // expect(duty.isDailyWorkerAtFridayAtNight(worker)).toEqual(expectedReturn);
  });
}

describe(ExtraDuty.name, () => {
  describe('isDailyWorkerAtFridayAtNight', () => {
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

    createIsDailyWorkerAtFridayAtNightTest(`extra duty is at friday and is at night but worker isn't a daily worker`, {
      duty: {
        day: 5,
        index: 0,
      },
      worker: {
        daysOfWork: [],
      }
    }, false);
  });

  describe('collidesWithTomorrowWork', () => {
    test(`shold return true if duty collides with tomorrow work time off`, () => {
      // TODO remake a rule checker test
      // const { duty, worker } = mocks({
      //   duty: {
      //     day: 7,
      //     index: 1,
      //   },
      //   worker: {
      //     daysOfWork: [8],
      //     workTime: new WorkTime(7, 12),
      //   },
      // });

      // expect(duty.collidesWithTomorrowWork(worker)).toBeTruthy();
    });
  });

  describe('canAdd', () => {
    test(`shold return false if worker has license at same day of duty`, () => {
      // TODO remake a rule checker test
      // const { worker, duty } = mocks({
      //   duty: {
      //     year: 2023,
      //     month: 9,
      //     day: 21,
      //     index: 1,
      //   },
      //   worker: {
      //     daysOfWork: []
      //   },
      // });

      // worker.daysOfWork.applyLicenseInterval(new LicenseInterval(null, new Day(2023, 11, 20)));

      // expect(duty.canAdd(worker)).toBeFalsy();
    });
  });
});