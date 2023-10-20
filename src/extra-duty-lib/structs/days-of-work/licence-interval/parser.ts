import { LicenseInterval } from ".";
import { DEFAULT_DAY_PARSER, DayParser } from "../../day/parser";

export const DEFAULT_MEDICAL_LICENCE_REGEXP = /LICENÇA MÉDICA \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;
export const DEFAULT_PREMIUM_LICENCE_REGEXP = /LICENÇA PRÊMIO \((DE (\d{2}\/\d{2}\/\d{2}) )?ATÉ (\d{2}\/\d{2}\/\d{2})\)/;

export interface LicenceIntervalParserConfig {
  dayParser?: DayParser;
  medicalLicenceRegExp?: RegExp;
  premiumLicenceRegExp?: RegExp;
}

export class LicenceIntervalParser {
  readonly dayParser: DayParser;
  readonly medicalLicenceRegExp: RegExp;
  readonly premiumLicenceRegExp: RegExp;
  
  constructor(config: LicenceIntervalParserConfig = {}) {
    this.dayParser = config.dayParser ?? DEFAULT_DAY_PARSER;
    this.medicalLicenceRegExp = config.medicalLicenceRegExp ?? DEFAULT_MEDICAL_LICENCE_REGEXP;
    this.premiumLicenceRegExp = config.premiumLicenceRegExp ?? DEFAULT_PREMIUM_LICENCE_REGEXP;
  }

  parse(data: string) {
    const matches = this.medicalLicenceRegExp.exec(data)
      ?? this.premiumLicenceRegExp.exec(data);

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

export const DEFAULT_LICENCE_INTERVAL_PARSER = new LicenceIntervalParser();