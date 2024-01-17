import { WorkerInfo, ExtraDuty } from "../../structs";

export function workerIsCompletelyBusy(worker: WorkerInfo) {
  return !worker.isCompletelyBusy();
}

export function isDailyWorker(worker: WorkerInfo) {
  return worker.daysOfWork.isDailyWorker
}

export type PointGetter = (day: number, firstMonday: number) => number;

export const isInsp = (worker: WorkerInfo) => worker.graduation === 'insp';
export const isSubInsp = (worker: WorkerInfo) => worker.graduation === 'sub-insp';
export const pointGetterMap: PointGetter[] = [
  (day, firstMonday) => -(isMonday(day, firstMonday) ? 50 : 500),
  () => -1000,
];

export function isMonday(day: number, firstMonday: number): boolean {
  return day % 7 === firstMonday
}

export function calculateDutyPontuation(duty: ExtraDuty, firstMonday: number): number {
  const pointGetter = pointGetterMap.at(duty.getSize());
  const isNightDuty = duty.index > 0;

  return (pointGetter?.(duty.day.index, firstMonday) ?? 0) * (isNightDuty ? 1 : 3);
}