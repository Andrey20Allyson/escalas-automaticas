import { DayOfWeek } from "../../../utils";
import { Day } from "../day";
import { ExtraDutyTableConfig } from "../extra-duty-table";

export interface ExtraEventConfig {
  readonly allowDaytime: boolean;
  readonly allowNighttime: boolean;
  readonly allowedWeekdays: 'every' | DayOfWeek[];
  readonly eventStartDay?: Day;
}

export namespace ExtraEventConfig {
  export function from(tableConfig: ExtraDutyTableConfig): ExtraEventConfig {
    return tableConfig.extraEvents[tableConfig.currentPlace] ?? DEFAULT_EXTRA_EVENT_CONFIG;
  }
}

export class ExtraEventConfigBuilder {
  static default(partialConfig?: Partial<ExtraEventConfig>): ExtraEventConfig {
    return {
      allowDaytime: partialConfig?.allowDaytime ?? true,
      allowNighttime: partialConfig?.allowNighttime ?? true,
      allowedWeekdays: 'every',
    }
  }
}

export const DEFAULT_EXTRA_EVENT_CONFIG: ExtraEventConfig = ExtraEventConfigBuilder.default();