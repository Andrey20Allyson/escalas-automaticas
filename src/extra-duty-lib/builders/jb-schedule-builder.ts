import { ExtraPlace } from "../structs";
import { JBScheduleAssigner } from "./assigners/jb-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifingScheduleBuilder } from "./classifing-schedule-builder";

export class JBDayScheduleBuilder extends ClassifingScheduleBuilder {
  constructor(
    tries: number,
  ) {
    super(
      ExtraPlace.JARDIM_BOTANICO,
      new DefaultScheduleClassifier(tries, new JBScheduleAssigner()),
    );
  }
}