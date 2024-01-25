import { WorkLimit, WorkLimitEntry } from ".";
import { parseNumberOrThrow } from "../../../utils";
import { Parser } from "../base/parser";
import { ExtraPlace } from "../extra-place";

export interface WorkLimitParserData {
  workLimit?: string;
}

export class WorkLimitParser implements Parser<WorkLimitParserData, WorkLimit> {
  parse(data: WorkLimitParserData): WorkLimit {
    if (data.workLimit === undefined) return new WorkLimit();
    
    const limits = data
      .workLimit
      .split(',')
      .map(parseNumberOrThrow);

    const limitEntries: WorkLimitEntry[] = [];

    const jqLimit = limits.at(0);
    if (jqLimit !== undefined) {
      limitEntries.push({
        limit: jqLimit,
        place: ExtraPlace.JIQUIA,
      });
    }
    
    const jbLimit = limits.at(1);
    if (jbLimit !== undefined) {
      limitEntries.push({
        limit: jbLimit,
        place: ExtraPlace.JARDIM_BOTANICO,
      });
    }
    
    return new WorkLimit(limitEntries);
  }
}