import { Alignment, Workbook, Worksheet } from 'exceljs';
import { DayOfExtraDuty, ExtraDutyTable, WorkerInfo } from "../../extra-duty-lib";
import { iterRange } from "../../utils";
import {
  SheetAddress,
  boldFont,
  centerHorizontalAlignment,
  fromExcelDim,
  graduationPrefixMap,
  normalBorder,
  parseDayIndex,
  parseWorkerID,
  primaryFill,
  secondaryFill,
  titleFill,
} from "./divugation-factory.utils";
import { TableFactory, TableFactoryOptions } from "./factory";
import { getGradNum } from './main-factory.utils';

enum DayListTableCollumn {
  INDEX = 1,
  NAME = 2,
  WORKER_ID = 3,
  DAY_LIST = 4,
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const rightHorizontalAlignment: Partial<Alignment> = { horizontal: 'right' };

export class DayListTableFactory implements TableFactory {
  async generate(table: ExtraDutyTable, options: TableFactoryOptions): Promise<Buffer> {
    const workerDaysMap = new Map<WorkerInfo, Set<DayOfExtraDuty>>();

    for (const entry of table.entries()) {
      let set = workerDaysMap.get(entry.worker);

      if (!set) {
        set = new Set<DayOfExtraDuty>();

        workerDaysMap.set(entry.worker, set);
      }

      set.add(entry.day);
    }

    const sortedWorkersAndDays = Array.from(workerDaysMap)
      .sort(([workerA], [workerB]) => workerA.fullWorkerID - workerB.fullWorkerID)
      .sort(([workerA], [workerB]) => getGradNum(workerA.config.grad) - getGradNum(workerB.config.grad));

    const book = new Workbook();

    const sheet = book.addWorksheet(options.sheetName);

    let actualRow = 1;

    const { year, month } = table.config;

    const monthName = monthNames.at(month)?.toUpperCase();
    if (!monthName) throw new Error(`Invalid month index '${month}'`);

    const titleCell = sheet.getCell(actualRow++, 1);
    titleCell.value = `EXTRA JIQUIÁ BRIGADA AMBIENTAL DE 1 Á ${table.width} DE ${monthName} - ${year}`;
    titleCell.style.alignment = centerHorizontalAlignment;
    titleCell.style.fill = titleFill;
    titleCell.style.font = boldFont;

    sheet.mergeCells([actualRow - 1, 1, actualRow - 1, 4]);

    const labelsRow = sheet.getRow(actualRow++);

    const indexLabelCell = labelsRow.getCell(DayListTableCollumn.INDEX);
    indexLabelCell.style.fill = titleFill;

    const nameLabelCell = labelsRow.getCell(DayListTableCollumn.NAME);
    nameLabelCell.value = 'NOME';
    nameLabelCell.style.font = boldFont;
    nameLabelCell.style.fill = titleFill;

    const workerIDLabelCell = labelsRow.getCell(DayListTableCollumn.WORKER_ID);
    workerIDLabelCell.value = 'MAT.';
    workerIDLabelCell.style.alignment = centerHorizontalAlignment;
    workerIDLabelCell.style.font = boldFont;
    workerIDLabelCell.style.fill = titleFill;

    const dayListLabelCell = labelsRow.getCell(DayListTableCollumn.DAY_LIST);
    dayListLabelCell.value = 'DIAS';
    dayListLabelCell.style.alignment = centerHorizontalAlignment;
    dayListLabelCell.style.font = boldFont;
    dayListLabelCell.style.fill = titleFill;

    let indexCellValue = 1;

    for (const [worker, daySet] of sortedWorkersAndDays) {
      const rowFill = actualRow % 2 === 0 ? primaryFill : secondaryFill;
      const row = sheet.getRow(actualRow++);
      const days = Array.from(daySet, day => day.index).sort((a, b) => a - b).map(parseDayIndex);

      const indexCell = row.getCell(DayListTableCollumn.INDEX);
      indexCell.value = `${indexCellValue++}.`;
      indexCell.style.fill = rowFill;
      indexCell.alignment = rightHorizontalAlignment;

      const nameCell = row.getCell(DayListTableCollumn.NAME);
      nameCell.value = `${graduationPrefixMap[worker.graduation]} ${worker.name}`;
      nameCell.style.fill = rowFill;

      const workerIDCell = row.getCell(DayListTableCollumn.WORKER_ID);
      workerIDCell.value = parseWorkerID(worker.fullWorkerID);
      workerIDCell.style.fill = rowFill;
      workerIDCell.style.alignment = centerHorizontalAlignment;

      const dayListCell = row.getCell(DayListTableCollumn.DAY_LIST);
      dayListCell.value = days.join(',');
      dayListCell.style.fill = rowFill;
      dayListCell.style.alignment = centerHorizontalAlignment;
    }

    borders(sheet, { col: 1, row: 1 }, { col: 4, row: actualRow - 1 });

    const indexCollumn = sheet.getColumn(DayListTableCollumn.INDEX);
    indexCollumn.width = fromExcelDim(3)

    const nameCollumn = sheet.getColumn(DayListTableCollumn.NAME);
    nameCollumn.width = fromExcelDim(51);

    const idCollumn = sheet.getColumn(DayListTableCollumn.WORKER_ID);
    idCollumn.width = fromExcelDim(9);

    const dayListCollumn = sheet.getColumn(DayListTableCollumn.DAY_LIST);
    dayListCollumn.width = fromExcelDim(25);

    const arrayBuffer = await book.xlsx.writeBuffer();

    return Buffer.from(arrayBuffer);
  }
}

export function borders(sheet: Worksheet, start: SheetAddress, end: SheetAddress) {
  for (const rowI of iterRange(start.row, end.row + 1)) {
    for (const colI of iterRange(start.col, end.col + 1)) {
      const cell = sheet.getCell(rowI, colI);

      cell.style.border = {
        bottom: normalBorder,
        right: normalBorder,
        left: normalBorder,
        top: normalBorder,
      };
    }
  }
}