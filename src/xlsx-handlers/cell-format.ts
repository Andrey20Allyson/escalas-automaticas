import type { CellHandler } from './cell';

type Formats = 'General' | 'Currency' | 'Thousands' | 'Percent' | 'Date' | 'Time';

export class CellFormatHandler {
  static readonly FORMAT_MAP: ReadonlyMap<Formats, string> = new Map<Formats, string>([
    ['Date', 'dd/mm/yyyy'],
    ['Time', '[$-F400]h:mm:ss'],
  ]);
  
  constructor(readonly handler: CellHandler) { }
  
  set(format: Formats) {
    this.handler.cell.w = CellFormatHandler.getFormat(format);
  }
  
  static getFormat(format: Formats) {
    return this.FORMAT_MAP.get(format) ?? format;
  }
}