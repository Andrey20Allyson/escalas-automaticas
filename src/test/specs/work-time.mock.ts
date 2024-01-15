import { WorkTime } from "../../extra-duty-lib";

export interface WorkTimeParseTestEntry {
  input: string;
  expectedResult: WorkTime;
}

export const WORK_TIME_PARSE_TESTS: WorkTimeParseTestEntry[] = [{
  input: '07 ÀS 16h 2ª/6ª ..',
  expectedResult: WorkTime.from(7, 18),
},{
  input: '12 ÀS 21h 2ª/6ª',
  expectedResult: WorkTime.from(12, 21),
},{
  input: '07 ÀS 16h 2ª/6ª',
  expectedResult: WorkTime.from(7, 16),
},{
  input: '01 ÀS 22h ..',
  expectedResult: WorkTime.from(1, 24),
},{
  input: '09 ÀS 09h 2ª/6ª .',
  expectedResult: WorkTime.from(9, 10),
},{
  input: '19 ÀS 07h',
  expectedResult: WorkTime.from(19, 7),
},{
  input: '07 ÀS 19h',
  expectedResult: WorkTime.from(7, 19),
}];