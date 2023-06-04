export const DAYS_IN_ONE_WEEK = 7;
export const MONDAY = 1;

export function dayOfWeekFrom(firstMondayDate: number, date: number): number {
  return date > firstMondayDate ?
    ((date - firstMondayDate + 1) % DAYS_IN_ONE_WEEK) :
    ((date + DAYS_IN_ONE_WEEK - firstMondayDate + 1) % DAYS_IN_ONE_WEEK);
}

export function daysUntilWeekDay(now: number, weekDay: number): number {
  return now > weekDay ? (weekDay + DAYS_IN_ONE_WEEK - now) % DAYS_IN_ONE_WEEK : (weekDay - now) % DAYS_IN_ONE_WEEK;
}

export function firtMonday(weekDay: number, monthDay: number): number {
  return (monthDay + daysUntilWeekDay(weekDay, MONDAY)) % DAYS_IN_ONE_WEEK;
}

export function isBusinessDay(firtMondayDate: number, date: number): boolean {
  const dayOfWeek = dayOfWeekFrom(firtMondayDate, date);

  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function firstMondayFromToday(): number {
  const date = new Date();

  return firtMonday(date.getDay(), date.getDate() - 1);
}

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function getMonth() {
  return new Date().getMonth();
}

export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getNumOfDaysInMonth(month: number) {
  const numOfDays = DAYS_IN_MONTH.at(month);
  if (!numOfDays) throw new Error(`Can't find the number of days in this month!`);
  return numOfDays;
}