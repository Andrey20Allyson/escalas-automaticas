import { ExtraDutyTableEntry } from "../../extra-duty-lib";
import { ExcelDate } from "../../xlsx-handlers/utils";

export enum OutputCollumns {
  NAME = 'B',
  REGISTRATION = 'C',
  GRAD = 'H',
  DATE = 'I',
  START_TIME = 'J',
  END_TIME = 'K',
  ITIN = 'D',
  EVENT = 'F',
  LOCATION_CODE = 'E',
  DETAILS = 'G',
}

export const GRAD_SORT_MAP = new Map<string, number>([
  ['GCM', 3],
  ['SI', 2],
  ['INSP', 1],
]);

export interface ExtraXLSXTableRow {
  name: string;
  grad: string;
  registration: number;
  date: number;
  startTime: number;
  endTime: number
  individualRegistry: number;
}

export function* iterRows(entries: Iterable<ExtraDutyTableEntry>): Iterable<ExtraXLSXTableRow> {
  for (const entry of entries) {
    for (let j = 0; j < 2; j++) {
      const startTime = ((entry.duty.start + 6 * j) % 24) / 24;
      const endTime = ((entry.duty.start + 6 * (j + 1)) % 24) / 24;
      const date = ExcelDate.normalize(
        entry.day.config.year,
        entry.day.config.month,
        entry.day.day,
      );

      const workerConfig = entry.worker.config;

      const name = workerConfig.name;
      const registration = workerConfig.workerID * 10 + workerConfig.postWorkerID;
      const grad = workerConfig.grad;
      const individualRegistry = workerConfig.individualRegistry;

      yield {
        date,
        endTime,
        grad,
        name,
        individualRegistry,
        registration,
        startTime,
      };
    }
  }
}

export function getGradNum(grad: string) {
  return GRAD_SORT_MAP.get(grad) ?? GRAD_SORT_MAP.size + 1;
}

export function sortByGrad(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return getGradNum(a.worker.config.grad) - getGradNum(b.worker.config.grad);
}

export function sortByRegistration(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return a.worker.config.workerID - b.worker.config.workerID;
}