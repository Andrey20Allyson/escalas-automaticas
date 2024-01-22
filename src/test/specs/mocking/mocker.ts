import { WorkerInfoConfig, ExtraDutyTable, WorkerInfo, ExtraDutyTableConfig } from "../../../extra-duty-lib";

export interface DutyMockOptions {
  dayIndex?: number,
  dutyIndex?: number,
}

export interface WorkerMockOptions extends Partial<WorkerInfoConfig> {
  name?: string;
}

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
  export function worker(options?: WorkerMockOptions): WorkerInfo {
    return WorkerInfo.fakeFromName(
      options?.name ?? 'John Due',
      options,
    );
  }
}