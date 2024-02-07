import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../inconsistences/warning";
import { IntegrityChecker } from "./integrity-checker";
import { ExtraDuty, ExtraEventName } from "../../../structs";
import { isMonday } from "../../../../utils";
import { ExtraEventAllowedTimeRule } from "../../rule-checking/rules/extra-event-allowed-time-rule";

export type PointGetter = (day: number, firstMonday: number) => number;

export class DutyMinQuantityChecker implements IntegrityChecker {
  pointGetterMap: PointGetter[] = [
    (day, firstMonday) => -(isMonday(day, firstMonday) ? 50 : 500),
    () => -700,
  ];

  constructor(
    readonly extraEventAllowedTimeRule = new ExtraEventAllowedTimeRule(),
  ) { }

  calculateDutyPontuation(duty: ExtraDuty, firstMonday: number): number {
    const pointGetter = this.pointGetterMap.at(duty.getSize());
    const isNightDuty = duty.index > 0;

    return (pointGetter?.(duty.day.index, firstMonday) ?? 0) * (isNightDuty ? 1 : 3);
  }

  check(integrity: TableIntegrity): void {
    for (const duty of integrity.table.iterDuties()) {
      if (this.extraEventAllowedTimeRule.canAssign(undefined, duty) === false) {
        continue;
      }

      if (integrity.table.config.currentPlace === ExtraEventName.JARDIM_BOTANICO_DAYTIME && duty.isNighttime()) continue;
      if (duty.getSize() >= 2) continue;

      const dutyQuantityPenality = -this.calculateDutyPontuation(duty, integrity.table.month.getFirstMonday());
      integrity.registry(new IntegrityWarning('insuficient num of workers in duty', dutyQuantityPenality));
    }
  }
}