import { test, expect, describe } from 'vitest';
import { ExtraDutyTableV2 } from '../../extra-duty-lib';
import { WorkerMocker } from './mock/worker';
import { analyseResult } from '../../utils';

const workerMocker = new WorkerMocker();

describe('Schedule Generator', () => {
  test('#generate shold return a valid extra table', () => {
    const year = 2023;
    const month = 10;

    const workers = workerMocker.createArray(30, { mode: 'random', config: { month, year } });

    const table = new ExtraDutyTableV2({ month, year });

    table.tryAssignArrayMultipleTimes(workers, 1000);

    table.calculatePontuation(table.firstMonday);

    const analisysString = analyseResult(table);
    console.log(analisysString);

    const pontuation = table.getPontuation();
    console.log(`pontuation: ${pontuation}`);

    expect(pontuation).toBeGreaterThan(-50000);
  });
});