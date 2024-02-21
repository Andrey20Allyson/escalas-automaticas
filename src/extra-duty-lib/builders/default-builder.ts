import { JBDaytimeScheduleBuilder } from "./jb-daytime-schedule-builder";
import { JQScheduleBuilder } from "./jq-schedule-builder";
import { StackScheduleBuilder } from "./stack-schedule-builder";
import { SupportToCHScheduleBuilder } from "./support-to-city-hall-schedule-builder";

export class DefautlScheduleBuilder extends StackScheduleBuilder {
  constructor(tries: number) {
    super([
      new SupportToCHScheduleBuilder(tries),
      new JBDaytimeScheduleBuilder(tries),
      new JQScheduleBuilder(tries),
    ]);
  }
}