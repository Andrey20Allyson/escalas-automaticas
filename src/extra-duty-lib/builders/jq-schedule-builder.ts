import { ExtraEventName } from "../structs";
import { DefaultScheduleAssigner } from "./assigners/default-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifyingScheduleBuilder } from "./classifying-schedule-builder";

export class JQScheduleBuilder extends ClassifyingScheduleBuilder {
  constructor(
    tries: number,
  ) {
    super(
      ExtraEventName.JIQUIA,
      new DefaultScheduleClassifier(tries, new DefaultScheduleAssigner()),
    );
  }
}