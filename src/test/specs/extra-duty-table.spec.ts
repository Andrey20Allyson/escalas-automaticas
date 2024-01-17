import { expect, test } from 'vitest';
import { ExtraDutyTable } from '../../extra-duty-lib/structs/extra-duty-table';
import { WorkerInfo } from '../../extra-duty-lib/structs/worker-info';

test(`#clear shold restart all workers positionsLeft`, () => {
  const worker0 = WorkerInfo.fakeFromName('Jose');
  const worker1 = WorkerInfo.fakeFromName('Roberto');
  const worker2 = WorkerInfo.fakeFromName('Cariane');

  const table = new ExtraDutyTable();

  const day0 = table.getDay(0);

  day0.getDuty(0).add(worker0);
  day0.getDuty(0).add(worker1);
  day0.getDuty(1).add(worker2);

  table.clear();

  expect(worker0.isPositionsLeftEqualsToStart()).toBeTruthy();
  expect(worker1.isPositionsLeftEqualsToStart()).toBeTruthy();
  expect(worker2.isPositionsLeftEqualsToStart()).toBeTruthy();
});