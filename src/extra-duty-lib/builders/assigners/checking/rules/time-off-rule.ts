import { DayOfExtraDuty, ExtraDutyTable, WorkerInfo } from "../../../../structs";
import { AssignmentRule } from "../assignment-rule";

export interface TimeOffCollisionTestConfig {
  worker: WorkerInfo;
  day: DayOfExtraDuty;
  dutyIndex: number;
  distance?: number;
  place?: string;
}

export class TimeOffAssignmentRule implements AssignmentRule {
  collidesWithTimeOff(config: TimeOffCollisionTestConfig) {
    const {
      day,
      dutyIndex,
      worker,
      place,
      distance = day.config.dutyMinDistance,
    } = config;

    const firstIndex = dutyIndex - distance;
    const lastIndex = dutyIndex + distance + 1;

    return day.includes(worker, firstIndex, lastIndex, place);
  }

  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    const day = table.getDay(dayIndex);
    if (day.config.dutyMinDistance < 1) throw new Error(`Distance can't be smaller than 1! distance: ${day.config.dutyMinDistance}`);

    const place = day.config.currentPlace;

    return this.collidesWithTimeOff({ worker, day, dutyIndex, place }) === false
      && this.collidesWithTimeOff({ worker, day, dutyIndex, distance: 1 }) === false;
  }

  canAssignInDay(): boolean {
    return true;
  }
}