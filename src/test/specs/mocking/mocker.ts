import { DaysOfWork, ExtraDutyTable, ExtraDutyTableConfig, WorkTime, WorkerInfo, WorkerInfoConfig } from "../../../extra-duty-lib";
import { WorkerIdentifier } from "../../../extra-duty-lib/structs/worker-identifier";
import { getMonth } from "../../../utils";

export interface DutyMockOptions {
  dayIndex?: number,
  dutyIndex?: number,
}

export interface WorkerMockOptions extends Partial<WorkerInfoConfig> { }

export interface WorkerAndDutyMockOptions {
  table?: Partial<ExtraDutyTableConfig>;
  worker?: WorkerMockOptions;
  duty?: DutyMockOptions;
}

export function mock(options?: WorkerAndDutyMockOptions) {
  const table = new ExtraDutyTable({ month: 0, ...options?.table });

  const duty = table
    .getDay(options?.duty?.dayIndex ?? 0)
    .getDuty(options?.duty?.dutyIndex ?? 0);

  const worker = mock.worker(options?.worker);

  return { table, duty, worker };
}

export module mock {
  let workerIdCount = 0;

  export function worker(options?: WorkerMockOptions): WorkerInfo {
    return new WorkerInfo({
      name: 'John Due',
      post: 'N/A',
      grad: 'GCM',
      identifier: new WorkerIdentifier(workerIdCount, 0),
      individualId: 0,
      gender: 'U',
      workTime: new WorkTime(7, 8),
      daysOfWork: DaysOfWork.fromDays([], 2023, getMonth()),
      ...options,
    });
  }
}