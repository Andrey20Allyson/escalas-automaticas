import { DaysOfWork } from "../../../../../extra-duty-lib";

export interface RandomDaysOfWorkOptions {
  /**
   * @default 0
   */
  month?: number;
  /**
   * @default 2023
   */
  year?: number;
  /**
   * @default .2
   */
  dailyWorkerRate?: number;
}

const DAYS_1 = [3, 4, 7, 8, 9, 12, 13, 17, 18, 21, 22, 23, 26, 27, 31];
const DAYS_2 = [1, 2, 5, 6, 10, 11, 14, 15, 16, 19, 20, 24, 25, 28, 29, 30];

export function randomDaysOfWork(options: RandomDaysOfWorkOptions = {}) {
  const {
    month = 0,
    year = 2023,
    dailyWorkerRate = .2
  } = options;

  const choice = Math.random();

  if (choice < dailyWorkerRate) return DaysOfWork.fromDailyWorker(year, month);

  if (choice < dailyWorkerRate + (1 - dailyWorkerRate) / 2) return DaysOfWork.fromDays(DAYS_1, year, month);

  return DaysOfWork.fromDays(DAYS_2, year, month);
}