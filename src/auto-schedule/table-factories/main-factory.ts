import { ExtraDutyTable, ExtraDutyTableEntry } from "../../extra-duty-table";
import { ResultType, enumerate } from "../../utils";
import { TableFactory, TableFactoryOptions, utils } from "../io";
import ExcelJS from 'exceljs';

export enum OutputCollumns {
  NAME = 'B',
  REGISTRATION = 'C',
  GRAD = 'H',
  DATE = 'I',
  START_TIME = 'J',
  END_TIME = 'K',
  ITIN = 'D',
  EVENT = 'F',
  LOCATION_CODE = 'E',
  DETAILS = 'G',
}

export interface ExtraXLSXTableRow {
  name: string;
  grad: string;
  registration: number;
  date: number;
  startTime: number;
  endTime: number
}

function* iterRows(entries: Iterable<ExtraDutyTableEntry>): Iterable<ExtraXLSXTableRow> {
  for (const entry of entries) {
    for (let j = 0; j < 2; j++) {
      const startTime = ((entry.duty.start + 6 * j) % 24) / 24;
      const endTime = ((entry.duty.start + 6 * (j + 1)) % 24) / 24;
      const date = 365.25 * (2023 - 1900) + (365.25 / 12) * (entry.day.config.month) + entry.day.day + 1;
      
      const workerConfig = entry.worker.config;
      
      const name = workerConfig.name;
      const registration = workerConfig.registration;
      const grad = workerConfig.patent;

      yield {
        date,
        endTime,
        grad,
        name,
        registration,
        startTime,
      };
    }
  }
}

const GRAD_SORT_MAP = new Map<string, number>([
  ['GCM', 3],
  ['SI', 2],
  ['INSP', 1],
]);

function getGradNum(grad: string) {
  return GRAD_SORT_MAP.get(grad) ?? GRAD_SORT_MAP.size + 1;
}

function sortByGrad(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return getGradNum(a.worker.config.patent) - getGradNum(b.worker.config.patent);
}

function sortByRegistration(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return a.worker.config.registration - b.worker.config.registration;
}

export class MainTableFactory implements TableFactory {
  constructor(readonly buffer: Buffer | ArrayBuffer) { }

  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<ResultType<Buffer>> {
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(this.buffer);

    const entries = Array.from(table.entries());

    entries.sort(sortByRegistration);

    entries.sort(sortByGrad);

    const sheet = book.getWorksheet(options.sheetName);

    for (const [i, rowData] of enumerate(iterRows(entries))) {
      const row = sheet.getRow(i + 15);

      const nameCell = row.getCell(OutputCollumns.NAME);
      const registrationCell = row.getCell(OutputCollumns.REGISTRATION);
      const gradCell = row.getCell(OutputCollumns.GRAD);
      const dateCell = row.getCell(OutputCollumns.DATE);
      const startTimeCell = row.getCell(OutputCollumns.START_TIME);
      const endTimeCell = row.getCell(OutputCollumns.END_TIME);
      
      const eventCell = row.getCell(OutputCollumns.EVENT);
      const detailsCell = row.getCell(OutputCollumns.DETAILS);
      const ITINCell = row.getCell(OutputCollumns.ITIN);
      const locationCodeCell = row.getCell(OutputCollumns.LOCATION_CODE);

      locationCodeCell.value = 7;
      eventCell.value = 'PARQUE DO JIQUIÁ';
      detailsCell.value = 'SEGURANÇA E APOIO A SMAS';
      ITINCell.value = 0;

      nameCell.value =  rowData.name;
      registrationCell.value = rowData.registration;
      gradCell.value =  rowData.grad;
      dateCell.value = rowData.date;
      startTimeCell.value = rowData.startTime;
      endTimeCell.value = rowData.endTime;
    }

    return Buffer.from(await book.xlsx.writeBuffer());
  }
}