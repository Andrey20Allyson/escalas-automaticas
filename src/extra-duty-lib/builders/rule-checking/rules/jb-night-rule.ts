import { DaysOfWeek } from "../../../../utils";
import { ExtraDuty, WorkerInfo } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export interface JBNightAssignmentRuleConfig {
  active: boolean;
  blockAll: boolean;
  allowedWeekDays: DaysOfWeek[];
}

export type JBNightAssignmentRuleOptions = Partial<JBNightAssignmentRuleConfig>;

export class JBNightAssignmentRule implements AssignmentRule {
  readonly config: JBNightAssignmentRuleConfig;

  constructor(options?: JBNightAssignmentRuleOptions) {
    this.config = {
      active: options?.active ?? true,
      blockAll: options?.blockAll ?? false,
      allowedWeekDays: options?.allowedWeekDays ?? [DaysOfWeek.FRIDAY, DaysOfWeek.SATURDAY, DaysOfWeek.SUMDAY],
    };
  }

  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    if (this.config.active === false || duty.isNightly === false) return true;

    return this.config.blockAll === false
      && this.config.allowedWeekDays.includes(duty.weekDay);
  }
}