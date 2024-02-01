import { describe, expect, test } from 'vitest';
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

      const includesWorker = day.includes(worker, 0, 5);

      expect(includesWorker)
        .toBeTruthy();
    });
  });

  describe(DayOfExtraDuty.prototype.pair.name, () => {
    test(`shold return a pair that nighttime array only have nighttime duties`, () => {
      const { table } = mock();

      const pair = table.getDay(0).pair();

      expect(pair.nighttime().every(duty => duty.isNighttime()))
        .toBeTruthy();
    });

    test(`shold return a pair that daytime array only have daytime duties`, () => {
      const { table } = mock();

      const pair = table.getDay(0).pair();

      expect(pair.daytime().every(duty => duty.isDaytime()))
        .toBeTruthy();
    });

    test(`shold return a pair that sum of daytime and nighttime array length is equals to day size`, () => {
      const { table } = mock();

      const day = table.getDay(0);
      const pair = day.pair();

      const sum = pair.daytime.length + pair.nighttime.length;

      expect(sum)
        .toStrictEqual(day.getSize());
    });
  });
});