import { ExtraDuty, WorkerInfo } from "../../../structs";
import { ExtraEventConfig } from "../../../structs/extra-events/extra-event-config";
import { AssignmentRule } from "../assignment-rule";

export class ExtraEventAllowedTimeRule implements AssignmentRule {
  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    const eventConfig = ExtraEventConfig.from(duty.config);

    if (eventConfig.allowDaytime === false && duty.isDaytime()) {
      return false;
    }

    if (eventConfig.allowNighttime === false && duty.isNighttime()) {
      return false;
    }

    return true;
  }
}