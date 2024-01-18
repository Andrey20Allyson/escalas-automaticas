import { ExtraPlace } from "../structs";
import { JBScheduleAssigner } from "./assigners/jb-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifyingScheduleBuilder } from "./classifying-schedule-builder";

export class JBScheduleBuilder extends ClassifyingScheduleBuilder {
  constructor(
    tries: number,
  ) {
    super(
      ExtraPlace.JARDIM_BOTANICO,
      new DefaultScheduleClassifier(tries, new JBScheduleAssigner()),
    );
  }
}