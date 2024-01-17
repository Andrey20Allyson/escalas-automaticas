import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleBuilder } from "./schedule-builder";

export class StackScheduleBuilder implements ScheduleBuilder {
  readonly builders: ReadonlyArray<ScheduleBuilder>;
  
  constructor(
    builders: ScheduleBuilder[] = [],
  ) {
    this.builders = [...builders];
  }

  build(table: ExtraDutyTable, workers: WorkerInfo[]): ExtraDutyTable {
    return this
      .builders
      .reduce((prev, builder) => builder.build(prev, workers), table);
  }

  use(...builders: ScheduleBuilder[]): StackScheduleBuilder {
    return new StackScheduleBuilder(this.builders.concat(builders));
  }
}