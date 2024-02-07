export interface ExtraEventConfig {
  readonly allowDaytime: boolean;
  readonly allowNighttime: boolean;
}

export class ExtraEventConfigBuilder {
  static default(partialConfig?: Partial<ExtraEventConfig>): ExtraEventConfig {
    return {
      allowDaytime: partialConfig?.allowDaytime ?? true,
      allowNighttime: partialConfig?.allowNighttime ?? true,
    }
  }
}