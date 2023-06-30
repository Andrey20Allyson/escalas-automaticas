import * as XLSX from 'xlsx';
import { TableFactory, TableFactoryOptions } from ".";
import { ExtraDutyTable } from "../../extra-duty-lib";
import { toSheetBody, workerNameSorter } from './default-factory.utils';

export class DefaultTableFactory implements TableFactory {
  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer> {
    const book = XLSX.utils.book_new();
    const entries = Array.from(table.entries());

    if (options.sortByName) entries.sort(workerNameSorter);

    const sheetBody = toSheetBody(entries);

    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sheetBody), options.sheetName);

    return XLSX.write(book, { type: 'buffer' });
  }
}
