import { describe, expect, test } from 'vitest';
import { DaysOfWorkParser } from '../../../extra-duty-lib/structs/days-of-work/parser';
import { Month } from '../../../extra-duty-lib/structs/month';
import { iterRange } from '../../../utils';
import { createRandomHourly } from '../mocking/days-of-work-parser.mock';

function testParsePeriodic(index?: number) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const post = 'Unknown';
  const name = 'John Due';

  const parser = new DaysOfWorkParser({ periodic: { daySeparator: ',' } });
  const mock = createRandomHourly(new Month(year, month));

  const daysOfOrdinarySet = new Set(mock.daysOfOrdinary);

  test(`test #${index} : Shold parse '${mock.text}'`, () => {
    const parsed = parser.parse({ hourly: mock.text, month, post, year, name });

    for (const dayOfWork of parsed.entries()) {
      if (daysOfOrdinarySet.has(dayOfWork.day)) {
        expect(dayOfWork.work).toBeTruthy();
        continue;
      }

      expect(dayOfWork.work).toBeFalsy();
    }
  });
}

function testErrorOnParsePeriodic(index?: number) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const post = 'Unknown';
  const name = 'John Due';

  const parser = new DaysOfWorkParser({ periodic: { daySeparator: ';' } });
  const mock = createRandomHourly(new Month(year, month));

  test(`test $${index} : Shold throw`, () => {
    expect(() => parser.parse({ hourly: mock.text, month, post, year, name }))
      .toThrow();
  });
}

describe(DaysOfWorkParser.name, () => {
  describe(DaysOfWorkParser.prototype.parsePeriodic.name, () => {
    const NUM_OF_TESTS = 50;

    Array
      .from(iterRange(0, NUM_OF_TESTS))
      .forEach(testParsePeriodic);

    testErrorOnParsePeriodic(0);
  });
});