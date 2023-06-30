import { ExtraDutyTableEntry } from "../../extra-duty-lib";

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
      const date = 365.25 * (2023 - 1900) + (365.25 / 12) * entry.day.config.month + entry.day.day + 1;

      const workerConfig = entry.worker.config;

      const name = workerConfig.name;
      const registration = workerConfig.registration * 10 + workerConfig.postResistration;
      const grad = workerConfig.patent;
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
  return getGradNum(a.worker.config.patent) - getGradNum(b.worker.config.patent);
}

export function sortByRegistration(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return a.worker.config.registration - b.worker.config.registration;
}