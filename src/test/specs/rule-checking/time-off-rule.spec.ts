import { describe, expect, test } from "vitest";
import { TimeOffAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";

describe(TimeOffAssignmentRule.name, () => {
  test(`shold return false if duty collides with time off`, () => {
    const { table, worker } = mock({
      table: {
        dutyMinDistance: 20,
      }
    });

    const duty1 = table.getDay(0).getDuty(0);
    duty1.add(worker);

    const duty2 = table.getDay(1).getDuty(0);

    const canAssign = new TimeOffAssignmentRule()
      .canAssign(worker, duty2);

    expect(canAssign)
      .toBeFalsy();
  });

  test(`shold return false if duty already has the worker`, () => {
    const { duty, worker } = mock();

    duty.add(worker);

    const canAssign = new TimeOffAssignmentRule()
      .canAssign(worker, duty);

    expect(canAssign)
      .toBeFalsy();
  });

  test(`shold return true if duty don't collides with time out`, () => {
    const { worker, table } = mock({
      table: {
        dutyMinDistance: 2,
      },
    });

    table
      .getDuty(0, 0)
      .add(worker);

    const duty = table.getDuty(4, 0);

    const canAssign = new TimeOffAssignmentRule()
      .canAssign(worker, duty);

    expect(canAssign)
      .toBeTruthy();
  });
});