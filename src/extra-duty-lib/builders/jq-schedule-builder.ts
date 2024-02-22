import { ExtraEventName } from "../structs";
import { MultiStepScheduleAssigner } from "./assigners/multi-step-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifyingScheduleBuilder } from "./classifying-schedule-builder";

export class JQScheduleBuilder extends ClassifyingScheduleBuilder {
  constructor(
    tries: number,
  ) {
    super(
      ExtraEventName.JIQUIA,
      new DefaultScheduleClassifier(tries, MultiStepScheduleAssigner.default()),
    );
  }
}