import { describe, expect, test } from 'vitest';
import { WorkTimeParser } from '../../../extra-duty-lib/structs/work-time/parser';
import { WORK_TIME_PARSE_TESTS, WorkTimeParseTestEntry } from '../mocking/work-time.mock';

function testWorkTimeParser(entry: WorkTimeParseTestEntry, index: number){
  test(`test #${index} : Shold parse '${entry.input}' to '${JSON.stringify(entry.expectedResult)}'`, () => {
    const parser = new WorkTimeParser();

    const result = parser.parse({
      hourly: entry.input,
      name: 'John Due',
    });

    expect(result.equals(entry.expectedResult))
      .toBeTruthy();
  });
}

describe(WorkTimeParser.name, () => {
  describe(WorkTimeParser.prototype.parse.name, () => {
    Array
      .from(WORK_TIME_PARSE_TESTS)
      .forEach(testWorkTimeParser);
  });
});