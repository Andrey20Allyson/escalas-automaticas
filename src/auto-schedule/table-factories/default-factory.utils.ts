import { ExtraDutyTableEntry } from "../../extra-duty-lib";

export function toInterval(start: number, end: number) {
  return `${start.toString().padStart(2, '0')} ÀS ${end.toString().padStart(2, '0')}h`;
}

export function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
  return a.worker < b.worker ? -1 : a.worker > b.worker ? 1 : 0;
}

export function toStringTuple(entry: ExtraDutyTableEntry, index: number): string[] {
  return [
    (entry.day.day + 1).toString(),
    toInterval((entry.duty.start + 6 * index) % 24, (entry.duty.start + 6 * (index + 1)) % 24),
    entry.worker.name,
    `${entry.worker.config.workerID}-${entry.worker.config.postWorkerID}`,
    entry.worker.config.grad,
    entry.worker.config.post,
  ];
}

export function toSheetBody(entries: ExtraDutyTableEntry[]): string[][] {
  const body: string[][] = [['Dia', 'Plantão', 'Nome', 'Mat', 'Grad', 'Posto']];

  for (const entry of entries) {
    body.push(toStringTuple(entry, 0));
    body.push(toStringTuple(entry, 1));
  }

  return body;
}