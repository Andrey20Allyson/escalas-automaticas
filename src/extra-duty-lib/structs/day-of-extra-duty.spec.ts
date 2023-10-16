import { expect, test } from 'vitest';
import { ExtraDutyTableV2 } from '../extra-duty-table';
import { WorkerInfo } from './worker-info';

test(`shold return true if worker's duty are colliding with interval`, () => {
  const table = new ExtraDutyTableV2({ dutyMinDistance: 20 });
  const worker = WorkerInfo.fakeFromName('Roberto');

  const day14 = table.getDay(14);
  const day10 = table.getDay(10);

  day14.insert(worker, 1);

  expect(day10.otherDutiesHasWorker(worker, 0)).toBeTruthy();
});