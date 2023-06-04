import { test, expect } from 'vitest';
import { ExtraDutyTable } from '.';
import { WorkerInfo } from './worker-info';
import { DaysOfWork, WorkTime } from './parsers';

function workerFromName(name: string) {
  return new WorkerInfo(
    name,
    new WorkTime(0, 8),
    DaysOfWork.fromDays([]),
  );
}

test(`Test`, () => {
  
});