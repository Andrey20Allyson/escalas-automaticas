import { expect, test } from 'vitest';
import { ExtraDutyTable } from '../../extra-duty-lib';
import { WorkerInfo } from '../../extra-duty-lib/structs/worker-info';

test(`shold return true if worker's duty are colliding with interval`, () => {
  // TODO remake a rule checker test
  // const table = new ExtraDutyTable({ dutyMinDistance: 20 });
  // const worker = WorkerInfo.fakeFromName('Roberto');

  // const day14 = table.getDay(14);
  // const day10 = table.getDay(10);

  // day14.insert(worker, 1);

  // expect(day10.otherDutiesHasWorker(worker, 0)).toBeTruthy();
});