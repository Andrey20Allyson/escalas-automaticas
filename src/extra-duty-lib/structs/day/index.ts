import { DayParser } from "./parser";

export class Day {
  constructor(
    readonly year: number,
    readonly month: number,
    readonly index: number,
  ) { }

  static parse(text: string): Day {
    return new DayParser(text).parse();
  }
}