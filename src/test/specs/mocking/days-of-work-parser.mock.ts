import { Month } from "../../../extra-duty-lib/structs/month";
import { randomIntFromInterval } from "../../../utils";

export function createHourlyStringFrom(days: number[], sep = ', '): string {
  return `(DIAS: ${days.map(num => num + 1).join(sep)})`;
}

export interface HourlyMock {
  daysOfOrdinary: number[];
  text: string;
}

export function createRandomHourly(month: Month): HourlyMock {
  const daysOfOrdinary: number[] = [];

  const start = randomIntFromInterval(2, 3);

  for (let i = start; i < month.getNumOfDays(); i++) {
    const consecutiveDays = randomIntFromInterval(2, 3);
    for (let j = 0; j < consecutiveDays; j++, i++) {
      daysOfOrdinary.push(i);
    }

    const restDays = randomIntFromInterval(2, 3);
    i += restDays - 1;
  }

  const text = createHourlyStringFrom(daysOfOrdinary);

  return {
    daysOfOrdinary,
    text,
  };
}