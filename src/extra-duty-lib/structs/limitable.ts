import { Identifiable } from "./identifiable";
import { WorkLimit } from "./work-limit";

export interface Limitable extends Identifiable {
  limit: WorkLimit;
}