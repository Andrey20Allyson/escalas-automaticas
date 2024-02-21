import { describe, expect, test } from 'vitest';
import { ExtraDuty } from '../../../extra-duty-lib/structs/extra-duty';
import { mock } from '../mocking/mocker';

describe(ExtraDuty.name, () => {
  describe(ExtraDuty.prototype.getSize.name, () => {
    test(`Shold return the number of workers in the duty`, () => {
      const { duty } = mock();

      duty.add(mock.worker());
      duty.add(mock.worker());
      duty.add(mock.worker());

      expect(duty.getSize())
        .toStrictEqual(3);
    });
  });
});