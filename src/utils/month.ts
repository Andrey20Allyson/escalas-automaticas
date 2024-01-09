import { isLeapYear, thisYear } from "./year";

const FEBRUARY_MONTH_INDEX = 1;
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const thisMonth = getMonth();
export const numOfDaysInThisMonth = getNumOfDaysInMonth(thisMonth, thisYear);

export function getMonth() {
  return new Date().getMonth();
}

function getMappedNumOfDays(month: number) {
  const numOfDays = DAYS_IN_MONTH.at(month);
  if (!numOfDays) throw new Error(`Can't find the number of days in this month!`);
  return numOfDays;
}

export function getNumOfDaysInMonth(month: number, year: number) {
  return getMappedNumOfDays(month) + (isLeapYear(year) && month === FEBRUARY_MONTH_INDEX ? 1 : 0);
}