export interface ExtraEventConfigInit {
  readonly allowDaytime: boolean;
  readonly allowNighttime: boolean;
}

export class ExtraEventConfig {
  readonly config: ExtraEventConfigInit; 

  constructor(config?: Partial<ExtraEventConfigInit>) {
    this.config = ExtraEventConfig.default(config);
  }

  static default(partialConfig?: Partial<ExtraEventConfigInit>): ExtraEventConfigInit {
    return {
      allowDaytime: partialConfig?.allowDaytime ?? true,
      allowNighttime: partialConfig?.allowNighttime ?? true,
    }
  }
}