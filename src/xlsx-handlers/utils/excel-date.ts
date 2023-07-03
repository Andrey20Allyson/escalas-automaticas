export class ExcelDate {
  static readonly AVERAGE_TROPICAL_YEAR = 365.25;
  static readonly MONTHS_IN_A_YEAR = 12;
  static readonly AVERAGE_TROPICAL_MONTH = ExcelDate.AVERAGE_TROPICAL_YEAR / ExcelDate.MONTHS_IN_A_YEAR;
  static readonly FIRST_YEAR = 1900;

  constructor(
    public year: number,
    public month: number,
    public day: number,
  ) { }

  normalize(): number {
    return ExcelDate.normalize(this.year, this.month, this.day);
  }

  static normalize(year: number, month: number, day: number) {
    return (year - ExcelDate.FIRST_YEAR) * ExcelDate.AVERAGE_TROPICAL_YEAR +
      month * ExcelDate.AVERAGE_TROPICAL_MONTH +
      day + 1;
  }

  static fromDate(date: Date) {
    return new ExcelDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1,
    );
  }

  static parse(date: number): ExcelDate {
    const year = Math.floor(date / ExcelDate.AVERAGE_TROPICAL_YEAR);
    const month = Math.floor((date - year * ExcelDate.AVERAGE_TROPICAL_YEAR) / ExcelDate.AVERAGE_TROPICAL_MONTH);
    const day = Math.floor(date - year * ExcelDate.AVERAGE_TROPICAL_YEAR - month * ExcelDate.AVERAGE_TROPICAL_MONTH) - 1;

    return new ExcelDate(
      year + ExcelDate.FIRST_YEAR,
      month,
      day,
    );
  }
}
