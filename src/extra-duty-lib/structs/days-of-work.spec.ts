import { test, expect } from 'vitest';
import { DaySearch, DaysOfWork } from './days-of-work';

test(`shold return a number if has a day off`, () => {
  const daysOfWork = DaysOfWork.fromDays([0, 1, 2, 3, 4, 5, 6, 8, 10, 14], 2023, 0);

  const closestDayOff = daysOfWork.searchClosestDayOff(DaySearch.fromDay(0));

  expect(closestDayOff).toStrictEqual(7);
});

test(`shold return a undefined if has't a day off`, () => {
  const daysOfWork = DaysOfWork.fromAllDays(2023, 0);

  const closestDayOff = daysOfWork.searchClosestDayOff(DaySearch.fromDay(0));

  expect(closestDayOff).toStrictEqual(undefined);
});