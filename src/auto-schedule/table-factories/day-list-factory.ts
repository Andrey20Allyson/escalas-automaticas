import { Workbook, Worksheet } from 'exceljs';
import { DayOfExtraDuty, ExtraDutyTable, WorkerInfo } from "../../extra-duty-lib";
import { iterRange } from "../../utils";
import { SheetAddress, boldFont, centerHorizontalAlignment, fromExcelDim, graduationPrefixMap, normalBorder, parseWorkerID, primaryFill, secondaryFill, titleFill } from "./divugation-factory.utils";
import { TableFactory, TableFactoryOptions } from "./factory";

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

    const book = new Workbook();

    const sheet = book.addWorksheet(options.sheetName);

    let actualRow = 1;
    const headRow = sheet.getRow(actualRow++);
    
    const nameLabelCell = headRow.getCell(1);
    nameLabelCell.value = 'NOME';
    nameLabelCell.style.alignment = centerHorizontalAlignment;
    nameLabelCell.style.font = boldFont;
    nameLabelCell.style.fill = titleFill;

    const workerIDLabelCell = headRow.getCell(2);
    workerIDLabelCell.value = 'MAT.';
    workerIDLabelCell.style.alignment = centerHorizontalAlignment;
    workerIDLabelCell.style.font = boldFont;
    workerIDLabelCell.style.fill = titleFill;

    const dayListLabelCell = headRow.getCell(3);
    dayListLabelCell.value = 'DIAS';
    dayListLabelCell.style.alignment = centerHorizontalAlignment;
    dayListLabelCell.style.font = boldFont;
    dayListLabelCell.style.fill = titleFill;

    for (const [worker, daySet] of workerDaysMap) {
      const rowFill = actualRow % 2 === 0 ? primaryFill : secondaryFill;
      const row = sheet.getRow(actualRow++);
      const days = Array.from(daySet, day => day.day + 1).sort((a, b) => a - b);

      const nameCell = row.getCell(1);
      nameCell.value =  `${graduationPrefixMap[worker.graduation]} ${worker.name}`;
      nameCell.style.fill = rowFill;
      
      const workerIDCell = row.getCell(2);
      workerIDCell.value = parseWorkerID(worker.fullWorkerID);
      workerIDCell.style.fill = rowFill;
      workerIDCell.style.alignment = centerHorizontalAlignment;

      const dayListCell = row.getCell(3);
      dayListCell.value = days.join(', ');
      dayListCell.style.fill = rowFill;
    }

    borders(sheet, { col: 1, row: 1 }, { col: 3, row: actualRow - 1 });

    const nameCollumn = sheet.getColumn(1);
    nameCollumn.width = fromExcelDim(49);

    const idCollumn = sheet.getColumn(2);
    idCollumn.width = fromExcelDim(12);

    const dayListCollumn = sheet.getColumn(3);
    dayListCollumn.width = fromExcelDim(28);
    
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