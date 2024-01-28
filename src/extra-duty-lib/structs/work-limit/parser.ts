import { WorkLimit, WorkLimitEntry } from ".";
import { enumerate, isDigit, parseNumberOrThrow } from "../../../utils";
import { Parser } from "../base/parser";
import { ExtraPlace } from "../extra-place";

export interface WorkLimitParserData {
  workLimit?: string;
}

export class WorkLimitParser implements Parser<WorkLimitParserData, WorkLimit> {
  parse(data: WorkLimitParserData): WorkLimit {
    if (data.workLimit === undefined) return new WorkLimit();

    const limits = this.parseNumberList(data.workLimit);

    console.log(limits);

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