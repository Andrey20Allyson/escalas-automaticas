import { describe, expect, test } from 'vitest';
import { BusyWorkerAssignmentRule } from '../../../extra-duty-lib/builders/rule-checking/rules';
import { mock } from '../mocking/mocker';

describe(BusyWorkerAssignmentRule.name, () => {
  test(`shold return false if worker is busy`, () => {
    const { duty, worker } = mock();

    const workerLimit = worker.limit.of(duty.config.currentPlace);
    duty.table.limiter.set(worker, workerLimit);

    const canAssign = new BusyWorkerAssignmentRule()
      .canAssign(worker, duty);

    expect(canAssign)
      .toBeFalsy();
  });

  test(`shold return true if worker is free to work`, () => {
    const { duty, worker } = mock();

    const canAssign = new BusyWorkerAssignmentRule()
      .canAssign(worker, duty);

    expect(canAssign)
      .toBeTruthy();
  });
});