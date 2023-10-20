export class Year {
  constructor(
    readonly index: number
  ) { }

  static normalize(year: number): number {
    return year < 1000 ? year + 2000 : year;
  }
}