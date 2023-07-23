import ExcelJS from 'exceljs';
import { DayOfExtraDuty, ExtraDuty, ExtraDutyTable, ExtraDutyTableEntry, Graduation, WorkerInfo } from "../../extra-duty-lib";
import { dayOfWeekFrom, enumerate, iterReverse } from "../../utils";

export function toDutyDesc(start: number, end: number) {
  const prefix = start < 18 ? 'Diurno' : 'Noturno';

  return `${prefix} (${start.toString().padStart(2, '0')} ÀS ${end.toString().padStart(2, '0')}h)`;
}

export function workerNameSorter(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry): number {
  return a.worker < b.worker ? -1 : a.worker > b.worker ? 1 : 0;
}

export const graduationPrefixMap: Record<Graduation, string> = {
  "sub-insp": 'SI',
  gcm: 'GCM',
  insp: 'INSP.'
}

export function toDayGridEntry(day: DayOfExtraDuty, duty: ExtraDuty, worker: WorkerInfo): DayGridEntry {
  const normalizedDutyStartTime = duty.start % 24;
  const normalizedDutyEndTime = duty.end % 24;

  const namePrefix = graduationPrefixMap[worker.graduation];

  return {
    duty: toDutyDesc(normalizedDutyStartTime, normalizedDutyEndTime),
    id: parseWorkerID(worker.fullWorkerID),
    name: `${namePrefix} ${worker.name}`,
  };
}

export function parseWorkerID(id: number): string {
  const stringifiedID = id.toString();
  let out = '-' + stringifiedID.slice(-1);

  for (const [i, digit] of enumerate(iterReverse(stringifiedID.slice(0, -1)))) {
    const separator = i > 0 && i % 3 === 0 ? '.' : '';
    out = digit + separator + out;
  }

  return out;
}

export function parseDayIndex(index: number) {
  return (index + 1).toString().padStart(2, '0');
}

interface DayGridEntry {
  duty: string;
  name: string;
  id: string;
}

interface DayGrid {
  title: string;
  entries: DayGridEntry[];
  numOfDiurnal: number;
  numOfNightly: number;
}

const weekDayNames = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

function fromExcelDim(dim: number) {
  return dim ** 2 / (dim - .71);
}

export function* iterGrids(table: ExtraDutyTable): Iterable<DayGrid> {
  for (const day of table) {
    const weekDay = dayOfWeekFrom(table.firstMonday, day.day);

    const weekDayName = weekDayNames.at(weekDay) ?? 'Unknow';

    const title = `Dia ${parseDayIndex(day.day)} (${weekDayName})`;

    const grid: DayGrid = { title, entries: [], numOfDiurnal: 0, numOfNightly: 0 };

    for (const duty of day) {
      for (const [_, worker] of duty) {
        grid.entries.push(toDayGridEntry(day, duty, worker));

        if (duty.start < 18 && duty.start >= 7) {
          grid.numOfDiurnal++;
        } else {
          grid.numOfNightly++;
        }
      }
    }

    yield grid;
  }
}

const label = ['TURNO', 'NOME', 'MATRÍCULA'];
const titleFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
const labelFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
const primaryFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
const secondaryFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFEFE' } };

const boldFont: Partial<ExcelJS.Font> = { bold: true };
const centerHorizontalAlignment: Partial<ExcelJS.Alignment> = { horizontal: 'center' };
const defaultRowPerPage = 47;

function pageFromRow(row: number) {
  return Math.floor((row - 1) / defaultRowPerPage);
}

function firstRowFromPage(page: number) {
  return Math.ceil(page * defaultRowPerPage) + 1;
}

export async function serializeTableToDivugation(table: ExtraDutyTable, sheetName: string) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet(sheetName);

  let rowStartI = 1;
  for (const grid of iterGrids(table)) {
    let lastRow = rowStartI + grid.entries.length + 3;

    const startPage = pageFromRow(rowStartI);
    const endPage = pageFromRow(lastRow - 2);

    if (startPage < endPage) {
      rowStartI = firstRowFromPage(endPage);

      lastRow = rowStartI + grid.entries.length + 3;
    }

    const pageFirstRow = firstRowFromPage(startPage);

    if (rowStartI - pageFirstRow <= 1) {
      rowStartI = pageFirstRow;

      lastRow = rowStartI + grid.entries.length + 3;
    }

    let actualRow = rowStartI;

    const titleCell = sheet.getCell(actualRow++, 1);
    titleCell.value = grid.title;
    titleCell.style.font = boldFont;
    titleCell.style.fill = titleFill;

    sheet.mergeCells([actualRow - 1, 1, actualRow - 1, 3]);

    const labelRow = sheet.getRow(actualRow++);
    for (const [i, value] of enumerate(label)) {
      const cell = labelRow.getCell(i + 1);

      cell.style.alignment = centerHorizontalAlignment;
      cell.style.font = boldFont;
      cell.style.fill = labelFill;

      cell.value = value;
    }

    for (const entry of grid.entries) {
      const row = sheet.getRow(actualRow++);

      const fill = (actualRow - rowStartI) % 2 === 1 ? primaryFill : secondaryFill;

      const { duty, id, name } = entry;

      const dutyCell = row.getCell(1);

      dutyCell.value = duty;
      dutyCell.style.fill = fill;

      const nameCell = row.getCell(2);

      nameCell.value = name;
      nameCell.style.fill = fill;

      const idCell = row.getCell(3);

      idCell.value = id;
      idCell.style.alignment = centerHorizontalAlignment;
      idCell.style.fill = fill;
    }

    const dutySeparationRow = lastRow - grid.numOfNightly - 2;

    makeGridBorders({ sheet, start: { col: 1, row: rowStartI }, end: { col: 3, row: lastRow - 2 }, dutySeparationRow });

    rowStartI = lastRow;
  }

  const dutyCollumn = sheet.getColumn(1);
  dutyCollumn.width = fromExcelDim(20);

  const nameCollumn = sheet.getColumn(2);
  nameCollumn.width = fromExcelDim(55);

  const idCollumn = sheet.getColumn(3);
  idCollumn.width = fromExcelDim(14);

  const arrayBuffer = await book.xlsx.writeBuffer();

  return Buffer.from(arrayBuffer);
}

export interface SheetAddress {
  row: number;
  col: number;
}

function createNormalBorder(): ExcelJS.Border {
  return { color: { argb: 'FF000000' }, style: 'thin' };
}

function createMediumBorder(): ExcelJS.Border {
  return { color: { argb: 'FF000000' }, style: 'medium' };
}

interface MakeGridBordersParams {
  dutySeparationRow: number;
  sheet: ExcelJS.Worksheet;
  start: SheetAddress;
  end: SheetAddress;
}

const mediumBorder = createMediumBorder();
const normalBorder = createNormalBorder();

export function makeGridBorders(params: MakeGridBordersParams) {
  const { dutySeparationRow, end, sheet, start } = params;

  for (let ri = start.row; ri <= end.row; ri++) {
    for (let ci = start.col; ci <= end.col; ci++) {
      const cell = sheet.getCell(ri, ci);

      if (ri === start.row) {
        cell.border = {
          bottom: mediumBorder,
          right: mediumBorder,
          left: mediumBorder,
          top: mediumBorder,
        };

        break;
      }

      cell.border = {
        left: ci === start.col ? mediumBorder : normalBorder,
        right: ci === end.col ? mediumBorder : normalBorder,
        top: ri === start.row ? mediumBorder : normalBorder,
        bottom: ri === dutySeparationRow || ri === end.row || ri - start.row < 2 ? mediumBorder : normalBorder,
      };
    }
  }
}