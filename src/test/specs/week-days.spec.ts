import { test, expect } from 'vitest';
import { firstMonday, isBusinessDay } from '../../utils/week-days';

function runFirstMondayTest(weekDay: number, monthDay: number, sholdReturn: number) {
  test(`${firstMonday.name} shold return ${sholdReturn} if weekDay is ${weekDay} and monthDay is ${monthDay}`, () => {
    const _firstMonday = firstMonday(weekDay, monthDay);
  
    expect(_firstMonday).toStrictEqual(sholdReturn);
  });
}

function runIsBusinessDayTest(firtMondayDate: number, date: number, sholdReturn: boolean) {
  test(`${isBusinessDay.name} shold return ${sholdReturn} if firstMondayDate is ${firtMondayDate} and date is ${date}`, () => {
    const result = isBusinessDay(firtMondayDate, date);

    expect(result).toStrictEqual(sholdReturn);
  });
}

const firstMondayTestsParams: Parameters<typeof runFirstMondayTest>[] = [
  [6, 2, 4],
  [6, 9, 4],
  [6, 16, 4],
  [6, 23, 4],

  [5, 1, 4],
  [5, 8, 4],
  [5, 15, 4],
  [5, 22, 4],
  [5, 29, 4],

  [4, 0, 4],
  [4, 7, 4],
  [4, 14, 4],
  [4, 21, 4],
  [4, 28, 4],

  [3, 6, 4],
  [3, 13, 4],
  [3, 20, 4],
  [3, 27, 4],

  [2, 5, 4],
  [2, 12, 4],
  [2, 19, 4],
  [2, 26, 4],
  
  [1, 4, 4],
  [1, 11, 4],
  [1, 18, 4],
  [1, 25, 4],
  
  [0, 3, 4],
  [0, 10, 4],
  [0, 17, 4],
  [0, 24, 4],
];

const isBusinessDayTestsParams: Parameters<typeof runIsBusinessDayTest>[] = [
  [4, 0, true],
  [4, 1, true],

  [4, 2, false],
  [4, 3, false],

  [4, 4, true],
  [4, 5, true],
  [4, 6, true],
  [4, 7, true],
  [4, 8, true],

  [4, 9, false],
  [4, 10, false],

  [4, 11, true],
  [4, 12, true],
  [4, 13, true],
  [4, 14, true],
  [4, 15, true],

  [4, 16, false],
  [4, 17, false],

  [4, 18, true],
  [4, 19, true],
  [4, 20, true],
  [4, 21, true],
  [4, 22, true],

  [4, 23, false],
  [4, 24, false],

  [4, 25, true],
  [4, 26, true],
  [4, 27, true],
  [4, 28, true],
  [4, 29, true],
];

for (const testParams of firstMondayTestsParams) {
  runFirstMondayTest(...testParams);
}

for (const testParams of isBusinessDayTestsParams) {
  runIsBusinessDayTest(...testParams);
}