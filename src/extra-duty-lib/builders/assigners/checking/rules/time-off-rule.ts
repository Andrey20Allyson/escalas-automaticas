import { ExtraDuty, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export interface TimeOffCollisionTestConfig {
  worker: WorkerInfo;
  duty: ExtraDuty;
  distance?: number;
  place?: string;
}

export class TimeOffAssignmentRule implements AssignmentRule {
  collidesWithTimeOff(config: TimeOffCollisionTestConfig) {
    const {
      duty,
      worker,
      place,
      distance = duty.config.dutyMinDistance,
    } = config;

    const firstIndex = duty.index - distance;
    const lastIndex = duty.index + distance + 1;

    return duty.day.includes(worker, firstIndex, lastIndex, place);
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (duty.config.dutyMinDistance < 1) throw new Error(`Distance can't be smaller than 1! distance: ${duty.config.dutyMinDistance}`);

    const place = duty.config.currentPlace;

    return this.collidesWithTimeOff({ worker, duty, place }) === false
      && this.collidesWithTimeOff({ worker, duty, distance: 1 }) === false;
  }

  canAssignInDay(): boolean {
    return true;
  }
}