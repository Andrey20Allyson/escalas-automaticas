import { JBScheduleBuilder } from "./jb-schedule-builder";
import { JQScheduleBuilder } from "./jq-schedule-builder";
import { StackScheduleBuilder } from "./stack-schedule-builder";

export class DefautlScheduleBuilder extends StackScheduleBuilder {
  constructor(tries: number) {
    super([
      new JQScheduleBuilder(tries),
      new JBScheduleBuilder(tries),
    ]);
  }
}