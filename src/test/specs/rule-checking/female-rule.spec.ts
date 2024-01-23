import { describe, expect, test } from "vitest";
import { FemaleAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";

describe(FemaleAssignmentRule.name, () => {
  const checker = new FemaleAssignmentRule();
  
  test(`Shold return false if duty don't have 'male' and is trying assign a 'female'`, () => {
    const { duty, worker } = mock({
      worker: {
        gender: 'female',
      }
    });

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return true if duty have a 'male' and is trying assign a 'female'`, () => {
    const { duty } = mock();

    const maleWorker = mock.worker({ gender: 'male' });
    const femaleWorker = mock.worker({ gender: 'female' });

    duty.add(maleWorker);

    expect(checker.canAssign(femaleWorker, duty))
      .toBeTruthy();
  });

  test(`Shold return true if is trying to assign a 'male'`, () => {
    const { duty, worker } = mock({
      worker: {
        gender: 'male',
      }
    });

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});