import { DaysOfWork, ExtraDutyTable, ExtraDutyTableConfig, WorkTime, WorkerInfo, WorkerInfoConfig } from "../../../extra-duty-lib";
import { Month } from "../../../extra-duty-lib/structs/month";
import { WorkerIdentifier } from "../../../extra-duty-lib/structs/worker-identifier";
import { getYear } from "../../../utils";

export interface DutyMockOptions {
  dayIndex?: number,
  dutyIndex?: number,
}

export interface WorkerMockOptions extends Partial<WorkerInfoConfig> {
  month?: Month;
}

export interface WorkerAndDutyMockOptions {
  table?: Partial<ExtraDutyTableConfig>;
  worker?: WorkerMockOptions;
  duty?: DutyMockOptions;
}

export function mock(options?: WorkerAndDutyMockOptions) {
  const table = new ExtraDutyTable({ month: 0, ...options?.table });
  const month = new Month(table.config.year, table.config.month);

  const duty = table
    .getDay(options?.duty?.dayIndex ?? 0)
    .getDuty(options?.duty?.dutyIndex ?? 0);

  const worker = mock.worker({
    month,
    ...options?.worker
  });

  return { table, duty, worker };
}

export module mock {
  let workerIdCount = 1;

  export function month(): Month {
    return new Month(
      getYear(),
      0,
    );
  }

  export function worker(options?: WorkerMockOptions): WorkerInfo {
    const month = options?.month ?? mock.month();

    return new WorkerInfo({
      name: 'John Due',
      post: 'N/A',
      graduation: 'gcm',
      identifier: new WorkerIdentifier(workerIdCount++, 0),
      individualId: 0,
      gender: 'N/A',
      workTime: new WorkTime(7, 12),
      daysOfWork: DaysOfWork.fromDays([], month.year, month.index),
      ...options,
    });
  }
}