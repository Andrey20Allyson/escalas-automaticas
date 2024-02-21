// import { describe, expect, test } from "vitest";
// import { ExtraDuty, ExtraDutyTable } from "../../../extra-duty-lib";
// import { JBNightAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
// import { DayOfWeek } from "../../../utils";
// import { mock } from "../mocking/mocker";

// export interface FindDutyWhereOptions {
//   isNightly: boolean;
//   weekDay: DayOfWeek;
// }

// function findDutyWhere(table: ExtraDutyTable, options: FindDutyWhereOptions): ExtraDuty {
//   return table.findDuty(duty => duty.isNighttime() === options.isNightly && duty.weekDay === options.weekDay)
//     ?? expect.fail(`Can't find a ${DayOfWeek[options.weekDay].toLowerCase()} duty at ${options.isNightly ? 'nighttime' : 'daytime'}`);
// }

// describe(JBNightAssignmentRule.name, () => {
//   const defaultChecker = new JBNightAssignmentRule();

//   test(`Shold return false if is a nighttime duty that don't is included at allowed weekdays`, () => {
//     const { table, worker } = mock();

//     const duties = [
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.MONDAY }),
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.TUESDAY }),
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.WEDNESDAY }),
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.THURSDAY }),
//     ];

//     for (const duty of duties) {
//       expect(defaultChecker.canAssign(worker, duty))
//         .toBeFalsy();
//     }
//   });

//   test(`Shold return true if is a nighttime duty that is included at allowed weekdays`, () => {
//     const { table, worker } = mock();

//     const duties = [
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.FRIDAY }),
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.SATURDAY }),
//       findDutyWhere(table, { isNightly: true, weekDay: DayOfWeek.SUMDAY }),
//     ];

//     for (const duty of duties) {
//       expect(defaultChecker.canAssign(worker, duty))
//         .toBeTruthy();
//     }
//   });

//   test(`Shold return true if is a daytime duty even if not is included at allowed weekdays`, () => {
//     const { table, worker } = mock();

//     const duties = [
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.MONDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.TUESDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.WEDNESDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.THURSDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.FRIDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.SATURDAY }),
//       findDutyWhere(table, { isNightly: false, weekDay: DayOfWeek.SUMDAY }),
//     ];

//     for (const duty of duties) {
//       expect(defaultChecker.canAssign(worker, duty))
//         .toBeTruthy();
//     }
//   });
// });