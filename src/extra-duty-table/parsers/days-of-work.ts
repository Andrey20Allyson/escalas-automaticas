import { getMonth, getNumOfDaysInMonth, firstMondayFromToday, isBusinessDay } from "../utils";

export const DAYS_OF_WORK_REGEXP = /\(DIAS:[^\d]*([^]*)\)/;

export class DaySearch {
  constructor(
    public past: number = 0,
    public next: number = 0,
  ) {

  }

  step() {
    this.past--;
    this.next++;
  }

  static fromDay(day: number) {
    return new this(day, day);
  }
}

export class DaysOfWork {
  private readonly days: boolean[];
  private numOfDaysOff: number;
  
  readonly length: number;

  constructor(month: number, startValue = false) {
    this.days = new Array(getNumOfDaysInMonth(month)).fill(startValue);

    this.length = this.days.length;
    
    this.numOfDaysOff = startValue ? 0 : this.length;
  }

  getNumOfDaysOff() {
    return this.numOfDaysOff;
  }

  work(day: number) {
    if (day >= this.length) return;

    if (this.days[day] === false) {
      this.numOfDaysOff--;
      this.days[day] = true;
    }
  }

  searchClosestDayOff(search: DaySearch): number | undefined {
    if (search.next === search.past && !this.workOn(search.next)) {
      const day = search.next;

      search.step();
      
      return day;
    }

    while (search.past >= 0 || search.next < this.length) {
      search.step();

      if (search.past >= 0 && !this.workOn(search.past)) return search.past;
      if (search.next < this.length && !this.workOn(search.next)) return search.next;
    }
  }

  notWork(day: number) {
    if (day >= this.length) return;
    
    if (this.days[day] === true) {
      this.numOfDaysOff++;
      this.days[day] = false;
    }
  }

  workOn(day: number): boolean {
    return this.days.at(day) === true;
  }

  static fromAllDays(month = getMonth()) {
    return new this(month, true);
  }

  static fromDays(days: number[], month = getMonth()): DaysOfWork {
    const daysOfWork = new this(month);

    for (const day of days) {
      daysOfWork.work(day);
    }

    return daysOfWork;
  }

  static fromDailyWorker(month: number) {
    const daysInThisMonth = getNumOfDaysInMonth(month);
    const firstMonday = firstMondayFromToday();
    const daysOfWork = new this(month);

    for (let i = 0; i < daysInThisMonth; i++) {
      if (isBusinessDay(firstMonday, i)) {
        daysOfWork.work(i);
      }
    }

    return daysOfWork;
  }

  static parsePeriodic(text: string, month = getMonth()): DaysOfWork | undefined {
    const matches = DAYS_OF_WORK_REGEXP.exec(text);
    if (!matches) return;

    const numbersString = matches.at(1);
    if (!numbersString) return;

    const days = numbersString.split(';').map(val => Number(val) - 1);

    return this.fromDays(days, month);
  }

  static parse(text: string, month = getMonth()): DaysOfWork | undefined {
    if (text.includes('2ª/6ª')) return this.fromDailyWorker(month);

    return this.parsePeriodic(text);
  }
}