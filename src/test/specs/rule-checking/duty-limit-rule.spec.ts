import { describe, expect, test } from "vitest";
import { DutyLimitAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";

describe(DutyLimitAssignmentRule.name, () => {
  const checker = new DutyLimitAssignmentRule();

  test(`Shold return false if duty is full`, () => {
    const { duty, worker } = mock({
      table: {
        dutyCapacity: 1,
      },
    });

    duty.add(worker);

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return true if duty have free space`, () => {
    const { duty, worker } = mock({
      table: {
        dutyCapacity: 1,
      }
    });

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});