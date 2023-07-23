import { TableFactory, TableFactoryOptions } from ".";
import { ExtraDutyTable } from "../../extra-duty-lib";
import { serializeTable2 } from './default-factory.utils';

export class DefaultTableFactory implements TableFactory {
  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer> {
    return serializeTable2(table, options.sheetName);
  }
}
