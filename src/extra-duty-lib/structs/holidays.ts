import zod from 'zod';
import { ResultError, ResultType } from '../../utils';

const holidaySchema = zod.object({
  day: zod.number(),
  month: zod.number(),
});

export interface Holiday extends zod.infer<typeof holidaySchema> { }

export class Holidays {
  constructor(private holidaysMap: Map<number, Holiday[]>) { }

  get(month: number): Holiday[] {
    return this.holidaysMap.get(month) ?? [];
  }

  iter() {
    return this.holidaysMap.values();
  }

  static safeParse(buffer: Buffer): ResultType<Holidays> {
    try {
      const data: unknown = JSON.parse(buffer.toString('utf-8'));

      const result = holidaySchema.array().safeParse(data);

      if (!result.success) return new ResultError(`Can't parse data to a array of Holidays!\n${result.error.toString()}`);

      return this.from(result.data);
    } catch (e) {
      return ResultError.create(e);
    }
  }

  static from(holidays: Holiday[]) {
    const holidaysMap: Map<number, Holiday[]> = new Map();

    for (const holiday of holidays) {
      const month = holiday.month;

      if (holidaysMap.has(month)) {
        holidaysMap.get(month)?.push(holiday);
      } else {
        holidaysMap.set(month, [holiday]);
      }
    }

    return new this(holidaysMap);
  }
}