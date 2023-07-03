export class ExcelTime {
  /**
   * The number of seconds in a day.
   */
  private static readonly SECONDS_IN_A_DAY: number = 86400;

  /**
   * The number of seconds in an hour.
   */
  private static readonly SECONDS_IN_AN_HOUR: number = 3600;

  /**
   * The number of seconds in a minute.
   */
  private static readonly SECONDS_IN_A_MINUTE: number = 60;

  /**
   * Creates an instance of ExcelTime.
   * @param hours The hours of the time.
   * @param minutes The minutes of the time.
   * @param seconds The seconds of the time.
   */
  constructor(
    public hours: number,
    public minutes: number,
    public seconds: number,
  ) { }

  /**
   * Normalizes the time to a value between 0 and 1.
   * @returns The normalized value of the time.
   */
  normalize(): number {
    return ExcelTime.normalize(this.hours, this.minutes, this.seconds);
  }

  /**
   * Normalizes the given time values into a decimal representation of the time fraction in a day.
   * 
   * @param hours - The number of hours.
   * @param minutes - The number of minutes (default: 0).
   * @param seconds - The number of seconds (default: 0).
   * @returns The normalized time fraction in a day.
   */
  static normalize(hours: number, minutes: number = 0, seconds: number = 0): number {
    const totalSeconds = hours * ExcelTime.SECONDS_IN_AN_HOUR +
      minutes * ExcelTime.SECONDS_IN_A_MINUTE + seconds;
    return totalSeconds / ExcelTime.SECONDS_IN_A_DAY;
  }

  /**
   * Converts a time value to an ExcelTime object.
   * @param time The time value in hours, where the number 1 represents 24 hours and 0.5 represents 12 hours.
   * @returns An ExcelTime object corresponding to the provided time value.
   */
  static parse(time: number): ExcelTime {
    const totalSeconds = time * ExcelTime.SECONDS_IN_A_DAY;
    const hours = Math.floor(totalSeconds / ExcelTime.SECONDS_IN_AN_HOUR);
    const minutes = Math.floor((totalSeconds % ExcelTime.SECONDS_IN_AN_HOUR) / ExcelTime.SECONDS_IN_A_MINUTE);
    const seconds = Math.floor(totalSeconds % ExcelTime.SECONDS_IN_A_MINUTE);
    return new ExcelTime(hours, minutes, seconds);
  }
}
