import { exit } from "process";
import { ExtraDuty, ExtraDutyTable, ExtraDutyTableEntry, ExtraEventName, Graduation } from "../../extra-duty-lib";

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
  date: Date;
  event: string;
  startTime: number;
  endTime: number
  individualRegistry: number;
}

const PAYMENT_GRADUATION_MAP = new Map<Graduation, string>([
  ['gcm', 'GCM'],
  ['sub-insp', 'SI'],
  ['insp', 'INSP'],
]);

export function parseGraduationToPayment(graduation: Graduation): string {
  const parsed = PAYMENT_GRADUATION_MAP.get(graduation);
  if (parsed === undefined) throw new Error(`Payment Schedule generator can't find grad for '${graduation}'`);

  return parsed;
}

export function eventFromDuty(duty: ExtraDuty): string {
  switch (duty.config.currentPlace) {
    case ExtraEventName.JARDIM_BOTANICO_DAYTIME:
      return 'JARDIM BOTÂNICO APOIO AS AÇÔES DIURNAS';
    case ExtraEventName.JIQUIA:
      return 'PARQUE DO JIQUIÁ';
    case ExtraEventName.SUPPORT_TO_CITY_HALL:
      return 'EVENTOS DE APOIO A PREFEITURA';
  }

  throw new Error(`Can't find a event name for place '${duty.config.currentPlace}'`);
}

export function sortByDaytimeAndNighttime(entry1: ExtraDutyTableEntry, entry2: ExtraDutyTableEntry): number {
  return +entry1.duty.isNighttime() - +entry2.duty.isNighttime();
}

const EXTRA_EVENT_SORT_VALUES = new Map<string, number>([
  [ExtraEventName.JIQUIA, 1],
  [ExtraEventName.JARDIM_BOTANICO_DAYTIME, 2],
  [ExtraEventName.SUPPORT_TO_CITY_HALL, 3],
]);

function sortPlaceByCorrectOrder(placeA: string, placeB: string): number {
  const a = EXTRA_EVENT_SORT_VALUES.get(placeA) ?? EXTRA_EVENT_SORT_VALUES.size + 1;
  const b = EXTRA_EVENT_SORT_VALUES.get(placeB) ?? EXTRA_EVENT_SORT_VALUES.size + 1;

  return a - b;
}

export function* iterRows(table: ExtraDutyTable): Iterable<ExtraXLSXTableRow> {
  const places = [...table.iterPlaces()].sort(sortPlaceByCorrectOrder);

  for (const place of places) {
    table.config.currentPlace = place;

    const entries = Array.from(table.entries());

    entries.sort(sortByRegistration);

    entries.sort(sortByGrad);

    if (place === ExtraEventName.JARDIM_BOTANICO_DAYTIME) entries.sort(sortByDaytimeAndNighttime);

    for (const entry of entries) {
      const startTime = (entry.duty.start % 24) / 24;
      const endTime = (entry.duty.end % 24) / 24;
      const date = new Date(
        entry.day.config.year,
        entry.day.config.month,
        entry.day.index + 1,
      );

      const workerConfig = entry.worker.config;

      const name = workerConfig.name;
      const registration = workerConfig.identifier.id;
      const grad = parseGraduationToPayment(workerConfig.graduation);
      const individualRegistry = workerConfig.individualId;

      yield {
        date,
        endTime,
        grad,
        name,
        individualRegistry,
        registration,
        startTime,
        event: eventFromDuty(entry.duty),
      };
    }
  }
}

export function getGradNum(grad: string) {
  return GRAD_SORT_MAP.get(grad) ?? GRAD_SORT_MAP.size + 1;
}

export function sortByGrad(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return getGradNum(a.worker.config.graduation) - getGradNum(b.worker.config.graduation);
}

export function sortByRegistration(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return a.worker.id - b.worker.id;
}