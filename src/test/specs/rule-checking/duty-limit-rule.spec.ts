import { describe, expect, test } from "vitest";
import { DutyLimitAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";

describe(DutyLimitAssignmentRule.name, () => {
  test(`Shold return false if duty is full`, () => {
    const { duty, worker } = mock({
      table: {
        dutyCapacity: 1,
      },
    });

    duty.add(worker);

    const canAssign = new DutyLimitAssignmentRule()
      .canAssign(worker, duty);

    expect(canAssign)
      .toBeFalsy();
  });
});