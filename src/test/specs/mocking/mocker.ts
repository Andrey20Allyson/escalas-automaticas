import { WorkerInfoConfig, ExtraDutyTable, WorkerInfo, ExtraDutyTableConfig } from "../../../extra-duty-lib";

export interface DutyMockOptions {
  dayIndex?: number,
  dutyIndex?: number,
}

export interface WorkerAndDutyMockOptions {
  table?: Partial<ExtraDutyTableConfig>;
  worker?: Partial<WorkerInfoConfig>;
  duty?: DutyMockOptions;
}

export function mock(options?: WorkerAndDutyMockOptions) {
  const table = new ExtraDutyTable({ month: 0, ...options?.table });

  const duty = table
    .getDay(options?.duty?.dayIndex ?? 0)
    .getDuty(options?.duty?.dutyIndex ?? 0);

  const worker = WorkerInfo.fakeFromName('John Due', options?.worker);

  return { table, duty, worker };
}