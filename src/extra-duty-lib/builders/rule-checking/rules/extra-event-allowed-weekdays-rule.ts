import { WorkerInfo, ExtraDuty } from "../../../structs";
import { ExtraEventConfig } from "../../../structs/extra-events/extra-event-config";
import { AssignmentRule } from "../assignment-rule";

export class ExtraEventAllowedWeekdaysRule implements AssignmentRule {
  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { allowedWeekdays } = ExtraEventConfig.from(duty.config); 

    if (allowedWeekdays === 'every') {
      return true;
    }

    return allowedWeekdays.includes(duty.weekDay);
  }
}