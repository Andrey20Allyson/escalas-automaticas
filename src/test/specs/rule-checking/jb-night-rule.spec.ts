import { describe, expect, test } from "vitest";
import { ExtraDuty, ExtraDutyTable } from "../../../extra-duty-lib";
import { JBNightAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { DaysOfWeek } from "../../../utils";
import { mock } from "../mocking/mocker";

export interface FindDutyWhereOptions {
  isNightly: boolean;
  weekDay: DaysOfWeek;
}

function findDutyWhere(table: ExtraDutyTable, options: FindDutyWhereOptions): ExtraDuty {
  return table.findDuty(duty => duty.isNightly === options.isNightly && duty.weekDay === options.weekDay)
    ?? expect.fail(`Can't find a ${DaysOfWeek[options.weekDay].toLowerCase()} duty at ${options.isNightly ? 'nighttime' : 'daytime'}`);
}

describe(JBNightAssignmentRule.name, () => {
  const defaultChecker = new JBNightAssignmentRule();

  test(`Shold return false if is a nighttime duty that don't is included at allowed weekdays`, () => {
    const { table, worker } = mock();

    const duties = [
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.MONDAY }),
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.TUESDAY }),
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.WEDNESDAY }),
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.THURSDAY }),
    ];

    for (const duty of duties) {
      expect(defaultChecker.canAssign(worker, duty))
        .toBeFalsy();
    }
  });

  test(`Shold return true if is a nighttime duty that is included at allowed weekdays`, () => {
    const { table, worker } = mock();

    const duties = [
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.FRIDAY }),
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.SATURDAY }),
      findDutyWhere(table, { isNightly: true, weekDay: DaysOfWeek.SUMDAY }),
    ];

    for (const duty of duties) {
      expect(defaultChecker.canAssign(worker, duty))
        .toBeTruthy();
    }
  });

  test(`Shold return true if is a daytime duty even if not is included at allowed weekdays`, () => {
    const { table, worker } = mock();

    const duties = [
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.MONDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.TUESDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.WEDNESDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.THURSDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.FRIDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.SATURDAY }),
      findDutyWhere(table, { isNightly: false, weekDay: DaysOfWeek.SUMDAY }),
    ];

    for (const duty of duties) {
      expect(defaultChecker.canAssign(worker, duty))
        .toBeTruthy();
    }
  });
});