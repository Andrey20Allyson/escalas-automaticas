import { test, describe, expect } from 'vitest';
import { DayOfExtraDuty } from '../../../extra-duty-lib';
import { mock } from '../mocking/mocker';

function verifyPrototype(value: unknown): DayOfExtraDuty {
  if (value instanceof DayOfExtraDuty === false) expect.fail(`The day returned by table shold be instanceof '${DayOfExtraDuty.name}'`);

  return value;
}

describe(DayOfExtraDuty.name, () => {
  describe(DayOfExtraDuty.prototype.includes.name, () => {
    test(`shold return true if worker is in range`, () => {
      const { table, worker } = mock();

      table.getDuty(1, 0).add(worker);

      const day = verifyPrototype(table.getDay(0));
  
      const includesWorker = day.includes(worker, 0, 4);

      expect(includesWorker)
        .toBeTruthy();
    });
  });
});