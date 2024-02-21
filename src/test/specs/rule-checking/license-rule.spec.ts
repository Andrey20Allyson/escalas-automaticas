import { describe, expect, test } from "vitest";
import { DaysOfWork } from "../../../extra-duty-lib";
import { LicenseAssignmentRule } from "../../../extra-duty-lib/builders/rule-checking/rules";
import { Day } from "../../../extra-duty-lib/structs/day";
import { LicenseInterval } from "../../../extra-duty-lib/structs/days-of-work/license-interval";
import { mock } from "../mocking/mocker";

describe(LicenseAssignmentRule.name, () => {
  const checker = new LicenseAssignmentRule();

  test(`Shold return false if worker has at license at same day of duty`, () => {
    const { duty } = mock();
    const { year, month } = duty.config;

    const worker = mock.worker({
      daysOfWork: new DaysOfWork(year, month, false, false),
    });

    worker.daysOfWork.applyLicenseInterval(
      new LicenseInterval(
        null,
        Day.fromLastOf(year, month),
      ),
    );

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return true if duty don't collides with worker license`, () => {
    const { duty } = mock({
      duty: {
        dayIndex: 12,
      }
    });
    
    const { year, month } = duty.config;

    const worker = mock.worker({
      daysOfWork: new DaysOfWork(year, month, false, false),
    });

    worker.daysOfWork.applyLicenseInterval(
      new LicenseInterval(
        null,
        new Day(year, month, 10),
      ),
    );

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});