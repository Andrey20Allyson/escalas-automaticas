import { JBDaytimeScheduleBuilder } from "./jb-daytime-schedule-builder";
import { JQScheduleBuilder } from "./jq-schedule-builder";
import { StackScheduleBuilder } from "./stack-schedule-builder";

export class DefautlScheduleBuilder extends StackScheduleBuilder {
  constructor(tries: number) {
    super([
      new JBDaytimeScheduleBuilder(tries),
      new JQScheduleBuilder(tries),
    ]);
  }
}