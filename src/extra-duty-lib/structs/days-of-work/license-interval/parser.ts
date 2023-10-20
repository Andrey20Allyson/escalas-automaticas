import { LicenseInterval } from ".";
import { DEFAULT_DAY_PARSER, DayParser } from "../../day/parser";

export const DEFAULT_MEDICAL_LICENSE_REGEXP = /LICENÇA MÉDICA \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;
export const DEFAULT_PREMIUM_LICENSE_REGEXP = /LICENÇA PRÊMIO \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;

export interface LicenseIntervalParserConfig {
  dayParser?: DayParser;
  medicalLicenseRegExp?: RegExp;
  premiumLicenseRegExp?: RegExp;
}

export class LicenseIntervalParser {
  readonly dayParser: DayParser;
  readonly medicalLicenseRegExp: RegExp;
  readonly premiumLicenseRegExp: RegExp;
  
  constructor(config: LicenseIntervalParserConfig = {}) {
    this.dayParser = config.dayParser ?? DEFAULT_DAY_PARSER;
    this.medicalLicenseRegExp = config.medicalLicenseRegExp ?? DEFAULT_MEDICAL_LICENSE_REGEXP;
    this.premiumLicenseRegExp = config.premiumLicenseRegExp ?? DEFAULT_PREMIUM_LICENSE_REGEXP;
  }

  parse(data: string) {
    const matches = this.medicalLicenseRegExp.exec(data)
      ?? this.premiumLicenseRegExp.exec(data);

    if (!matches) return null;

    const rawStartDay = matches.at(2);
    const rawEndDay = matches.at(3);
    if (rawEndDay === undefined) throw new Error(`Can't find a license end day in '${data}', expected a 'ATÉ dd/mm/yy' or 'ATÉ dd/mm/yyyy'`);

    return new LicenseInterval(
      rawStartDay === undefined ? null : this.dayParser.parse(rawStartDay),
      this.dayParser.parse(rawEndDay),
    );
  }
}

export const DEFAULT_LICENSE_INTERVAL_PARSER = new LicenseIntervalParser();