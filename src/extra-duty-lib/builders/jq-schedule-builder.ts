import { ExtraPlace } from "../structs";
import { JQScheduleAssigner } from "./assigners/jq-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifingScheduleBuilder } from "./schedule-builder";

export class JQScheduleBuilder extends ClassifingScheduleBuilder {
  constructor(
    tries: number,
  ) {
    super(
      ExtraPlace.JIQUIA,
      new DefaultScheduleClassifier(tries, new JQScheduleAssigner()),
    );
  }
}