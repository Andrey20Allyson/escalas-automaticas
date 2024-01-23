import { describe, expect, test } from "vitest";
import { InspAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";

describe(InspAssignmentRule.name, () => {
  const checker = new InspAssignmentRule();

  test(`Shold retrun true if worker is the first with 'insp' graduation`, () => {
    const { duty, worker } = mock({
      worker: {
        graduation: 'insp',
      },
    });

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });

  test(`Shold retrun false if is trying to assign a 'insp' in a duty that already have a 'insp'`, () => {
    const { duty, worker } = mock({
      worker: {
        graduation: 'insp',
      },
    });

    duty.add(worker);

    const inspWorker = mock.worker({ graduation: 'insp' });

    expect(checker.canAssign(inspWorker, duty))
      .toBeFalsy();
  });

  test(`Shold return true if is trying to assign a non 'insp' in a duty that have a 'insp'`, () => {
    const { duty, worker } = mock({
      worker: {
        graduation: 'insp',
      },
    });

    duty.add(mock.worker({ graduation: 'sub-insp' }));
    duty.add(mock.worker({ graduation: 'gcm' }));

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});