import { describe, expect, test } from "vitest";
import { WorkerInfo, WorkerInfoParser } from "../../../extra-duty-lib";
import { randomIntFromInterval } from "../../../utils";

describe(WorkerInfoParser.name, () => {
  describe(WorkerInfoParser.prototype.parse.name, () => {
    const licenseStr = 'LICENÇA PRÊMIO';

    test(`Shold return null if hourly is equals to '${licenseStr}'`, () => {
      const parser = new WorkerInfoParser();
      let worker: WorkerInfo | null;

      try {
        worker = parser.parse({
          grad: 'CGM',
          hourly: licenseStr,
          month: randomIntFromInterval(0, 11),
          year: randomIntFromInterval(2000, 3000),
          name: 'John Due',
          post: licenseStr,
          registration: '14242-43',
        });
      } catch {
        expect.fail(`Expected a return, but it throwned`);
      }

      expect(worker)
        .toBeNull();
    });
  });
});