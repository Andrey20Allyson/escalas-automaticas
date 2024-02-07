import { WorkLimit, WorkLimitEntry } from ".";
import { enumerate, isDigit, parseNumberOrThrow } from "../../../utils";
import { Parser } from "../base/parser";
import { ExtraEventName } from "../extra-place";

export interface WorkLimitParserData {
  workLimit?: string;
}

export const JQ_DEFAULT_LIMIT = 10;
export const JB_DAYTIME_DEFAULT_LIMIT = 0;
export const JB_NIGHTTIME_DEFAULT_LIMIT = 0;

export class WorkLimitParser implements Parser<WorkLimitParserData, WorkLimit> {
  parse(data: WorkLimitParserData): WorkLimit {
    if (data.workLimit === undefined) return new WorkLimit();

    const limits = this.parseNumberList(data.workLimit);

    const limitEntries: WorkLimitEntry[] = [];

    const jqLimit = limits.at(0);

    limitEntries.push({
      limit: jqLimit ?? JQ_DEFAULT_LIMIT,
      place: ExtraEventName.JIQUIA,
    });

    const jbDaytimeLimit = limits.at(1);
    limitEntries.push({
      limit: jbDaytimeLimit ?? JB_DAYTIME_DEFAULT_LIMIT,
      place: ExtraEventName.JARDIM_BOTANICO_DAYTIME,
    });

    const jbNighttimeLimit = limits.at(2);
    limitEntries.push({
      limit: jbNighttimeLimit ?? JB_NIGHTTIME_DEFAULT_LIMIT,
      place: ExtraEventName.JARDIM_BOTANICO_DAYTIME,
    });

    return new WorkLimit(limitEntries);
  }

  parseNumberList(str: string): number[] {
    const numbers: number[] = [];
    let selectedData = '';
    let isOpen = false;

    for (const [i, char] of enumerate(str)) {
      if (char === ' ') continue;

      if (char === '[') {
        if (isOpen) throw new SyntaxError(`unexpected token '[' at index ${i}`);

        isOpen = true;
        continue;
      }

      if (isOpen) {
        if (char === ']') {
          if (selectedData.length > 0) {
            numbers.push(parseNumberOrThrow(selectedData));
          }

          break;
        }

        if (char === ',') {
          numbers.push(parseNumberOrThrow(selectedData));

          selectedData = '';
          continue;
        }

        if (isDigit(char) === false) throw new SyntaxError(`unexpected token '${char}' at index ${i}`);

        selectedData += char;
        continue;
      }
    }

    return numbers;
  }
}