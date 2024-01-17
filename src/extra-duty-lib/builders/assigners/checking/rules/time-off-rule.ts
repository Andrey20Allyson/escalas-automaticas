import { DayOfExtraDuty, ExtraDutyTable, ExtraPlace, WorkerInfo } from "../../../../structs";
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

  *iterOtherPlaces(currentPlace: string): Iterable<ExtraPlace> {
    for (const place of Object.values(ExtraPlace)) {
      if (place !== currentPlace) return place;
    }
  }

  canAssign(table: ExtraDutyTable, worker: WorkerInfo, dayIndex: number, dutyIndex: number): boolean {
    const day = table.getDay(dayIndex);
    if (day.config.dutyMinDistance < 1) throw new Error(`Distance can't be smaller than 1! distance: ${day.config.dutyMinDistance}`);

    if (this.collidesWithTimeOff({ worker, day, dutyIndex, place: day.config.currentPlace })) {
      return false;
    }

    if (this.collidesWithTimeOff({ worker, day, dutyIndex, distance: 1 })) {
      return false;
    }

    return true;
  }

  canAssignInDay(): boolean {
    return true;
  }
}