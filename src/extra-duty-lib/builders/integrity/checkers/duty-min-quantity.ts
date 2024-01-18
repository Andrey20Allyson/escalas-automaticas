import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../inconsistences/warning";
import { IntegrityChecker } from "./integrity-checker";
import { ExtraDuty } from "../../../structs";
import { isMonday } from "../../../../utils";

export type PointGetter = (day: number, firstMonday: number) => number;

export class DutyMinQuantityChecker implements IntegrityChecker {
  pointGetterMap: PointGetter[] = [
    (day, firstMonday) => -(isMonday(day, firstMonday) ? 50 : 500),
    () => -1000,
  ];

  calculateDutyPontuation(duty: ExtraDuty, firstMonday: number): number {
    const pointGetter = this.pointGetterMap.at(duty.getSize());
    const isNightDuty = duty.index > 0;
  
    return (pointGetter?.(duty.day.index, firstMonday) ?? 0) * (isNightDuty ? 1 : 3);
  }

  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -this.calculateDutyPontuation(duty, integrity.table.firstMonday);
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}