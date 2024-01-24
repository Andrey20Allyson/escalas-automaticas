import { describe, expect, test } from "vitest";
import { OrdinaryAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";
import { iterRange } from "../../../utils";

describe(OrdinaryAssignmentRule.name, () => {
  const checker = new OrdinaryAssignmentRule();

  test(`Shold return false if duty's day collides with worker's ordinary work day`, () => {
    const { duty, worker } = mock();

    worker.daysOfWork.work(duty.day.index);

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return false if duty collides with worker's ordinary timeoff`, () => {
    const { table, worker } = mock();

    worker.daysOfWork.work(10);

    const day = table.getDay(9);
    const duty = day.getDuty(day.getSize() - 1);

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return true if duty don't collides with worker's ordinary`, () => {
    const { table, worker, duty } = mock({
      duty: {
        dayIndex: 17,
      },
    });

    Array.from(iterRange(0, 16))
      .concat(Array.from(iterRange(20, table.width)))
      .forEach(day => worker.daysOfWork.work(day));

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});