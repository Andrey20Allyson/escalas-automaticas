import ExcelJS from 'exceljs';
import { TableFactory, TableFactoryOptions } from '.';
import { ExtraDutyTable } from '../../extra-duty-lib';
import { enumerate } from "../../utils";
import { sortByRegistration, sortByGrad, iterRows, OutputCollumns } from './main-factory.utils';

export class MainTableFactory implements TableFactory {
  private cachedBook?: Promise<ExcelJS.Workbook>;

  constructor(readonly buffer: Buffer | ArrayBuffer) { }

  async createBook() {
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(this.buffer);

    return book;
  }

  async createCache() {
    this.cachedBook = this.createBook();
    
    return this.cachedBook;
  }

  getCachedBook() {
    if (!this.cachedBook) return;

    const book = this.cachedBook;
    delete this.cachedBook;

    return book;
  }

  async getBook() {
    const cachedBook = this.getCachedBook();
    if (cachedBook) return cachedBook;

    return this.createBook();
  }

  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer> {
    const book = await this.getBook();

    const sheet = book.getWorksheet(options.sheetName);

    const yearCell = sheet.getCell('C6');

    yearCell.value = table.config.year;

    const monthCell = sheet.getCell('C7');

    monthCell.value = table.config.month + 1;

    for (const [i, rowData] of enumerate(iterRows(table))) {
      const row = sheet.getRow(i + 15);

      const nameCell = row.getCell(OutputCollumns.NAME);
      const registrationCell = row.getCell(OutputCollumns.REGISTRATION);
      const gradCell = row.getCell(OutputCollumns.GRAD);
      const dateCell = row.getCell(OutputCollumns.DATE);
      const startTimeCell = row.getCell(OutputCollumns.START_TIME);
      const endTimeCell = row.getCell(OutputCollumns.END_TIME);

      const eventCell = row.getCell(OutputCollumns.EVENT);
      const detailsCell = row.getCell(OutputCollumns.DETAILS);
      const IRCell = row.getCell(OutputCollumns.ITIN);
      const locationCodeCell = row.getCell(OutputCollumns.LOCATION_CODE);

      locationCodeCell.value = 7;
      eventCell.value = rowData.event;
      detailsCell.value = 'SEGURANÇA E APOIO A SMAS';
      
      nameCell.value = rowData.name;
      registrationCell.value = rowData.registration;
      gradCell.value = rowData.grad;
      dateCell.value = rowData.date;
      startTimeCell.value = rowData.startTime;
      endTimeCell.value = rowData.endTime;
      IRCell.value = rowData.individualRegistry;
    }

    return Buffer.from(await book.xlsx.writeBuffer());
  }
}