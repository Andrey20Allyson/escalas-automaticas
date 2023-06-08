import { expect, test } from 'vitest';
import { ExtraDutyTableV2 } from './v2';
import { WorkerInfo } from './worker-info';

test(`#clear shold restart all workers positionsLeft`, () => {
  const worker0 = WorkerInfo.fromName('Jose');
  const worker1 = WorkerInfo.fromName('Roberto');
  const worker2 = WorkerInfo.fromName('Cariane');

  const table = new ExtraDutyTableV2();

  const day0 = table.getDay(0);

  day0.insert(worker0, 0);
  day0.insert(worker1, 0);
  day0.insert(worker2, 1);

  table.clear();

  expect(worker0.isPositionsLeftEqualsToStart()).toBeTruthy();
  expect(worker1.isPositionsLeftEqualsToStart()).toBeTruthy();
  expect(worker2.isPositionsLeftEqualsToStart()).toBeTruthy();
});