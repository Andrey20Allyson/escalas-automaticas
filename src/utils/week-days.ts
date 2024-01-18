import { numOfDaysInThisMonth } from "./month";

export const DAYS_IN_ONE_WEEK = 7;
export const MONDAY = 1;
const date = new Date();
export const thisMonthFirstMonday = firstMonday(date.getDay(), date.getDate() - 1);
export const thisMonthWeekends = Array.from(iterWeekendsFromThisMonth());

export enum DaysOfWeek {
  SUMDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}

export function firstMondayFromYearAndMonth(year: number, month: number) {
  const date = new Date(year, month, 1);

  return firstMondayFromDate(date);
}

export function firstMondayFromDate(date: Date) {
  return firstMonday(date.getDay(), date.getDate() - 1);
}

export function dayOfWeekFrom(firstMondayDate: number, date: number): number {
  return date > firstMondayDate ?
    ((date - firstMondayDate + 1) % DAYS_IN_ONE_WEEK) :
    ((date + DAYS_IN_ONE_WEEK - firstMondayDate + 1) % DAYS_IN_ONE_WEEK);
}

export function daysUntilWeekDay(now: number, weekDay: number): number {
  return now > weekDay ? (weekDay + DAYS_IN_ONE_WEEK - now) % DAYS_IN_ONE_WEEK : (weekDay - now) % DAYS_IN_ONE_WEEK;
}

export function firstMonday(weekDay: number, monthDay: number): number {
  return (monthDay + daysUntilWeekDay(weekDay, MONDAY)) % DAYS_IN_ONE_WEEK;
}

export function isBusinessDay(firtMondayDate: number, date: number): boolean {
  const dayOfWeek = dayOfWeekFrom(firtMondayDate, date);

  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function isMonday(day: number, firstMonday: number): boolean {
  return day % 7 === firstMonday
}

export interface Weekend {
  saturday?: number;
  sunday?: number;
}

export function iterWeekendsFromThisMonth(): Generator<Weekend> {
  return iterWeekends(thisMonthFirstMonday);
}

export function* iterWeekends(firstMonday: number): Generator<Weekend> {
  let firstSaturday = firstMonday - 2;

  for (let i = 0; i < 5; i++) {
    const weekend: Weekend = {};

    let saturday = firstSaturday + 7 * i;
    let sunday = saturday + 1;
    let canYield = false;
    
    if (saturday >= 0 && saturday - numOfDaysInThisMonth < 0) {
      weekend.saturday = saturday;
      canYield = true;
    }
    
    if (sunday >= 0 && sunday - numOfDaysInThisMonth < 0) {
      weekend.sunday = sunday;
      canYield = true;
    }

    if (canYield) {
      yield weekend;
    } else {
      break;
    }
  }
}