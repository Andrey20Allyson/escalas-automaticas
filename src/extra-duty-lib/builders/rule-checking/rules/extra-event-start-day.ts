import { ExtraDuty, WorkerInfo } from "../../../structs";
import { ExtraEventConfig } from "../../../structs/extra-events/extra-event-config";
import { AssignmentRule } from "../assignment-rule";

export class ExtraEventStartDayRule implements AssignmentRule {
  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    const { eventStartDay } = ExtraEventConfig.from(duty.config);
    
    if (eventStartDay === undefined) {
      return true;
    }

    return duty.day.date.isBefore(eventStartDay) === false;
  }
}