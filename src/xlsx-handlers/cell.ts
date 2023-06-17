import XLSX from 'xlsx';
import { ResultType, Result, ResultError } from '../utils/result';
import { CellFormatHandler } from './cell-format';

export type CellValueType = XLSX.CellObject['v'];

export type RunTimeCellTypeMap = {
  'empity': undefined;
  'boolean': boolean;
  'string': string;
  'number': number;
  'date': Date;
};

export type CellTypeMap = {
  'any': CellAnyType;
  'boolean?': boolean | undefined;
  'string?': string | undefined;
  'number?': number | undefined,
  'date?': Date | undefined;
} & RunTimeCellTypeMap;

export type RunTimeCellTypes = keyof RunTimeCellTypeMap;
export type CellTypes = keyof CellTypeMap;

export type CellAnyType = RunTimeCellTypeMap[keyof RunTimeCellTypeMap];

export class CellHandler<V extends CellAnyType = CellAnyType> {
  static readonly CONSTRUCTORS_MAP: ReadonlyMap<Function, RunTimeCellTypes> = new Map<Function, RunTimeCellTypes>([
    [String as Function, 'string'],
    [Boolean, 'boolean'],
    [Number, 'number'],
    [Date, 'date'],
  ]);

  static readonly TYPE_NAMES: ReadonlyMap<CellTypes, string> = new Map<CellTypes, string>([
    ['empity', 'undefined'],
  ]);

  static readonly XLSX_TYPE_MAP: ReadonlyMap<RunTimeCellTypes, XLSX.ExcelDataType> = new Map<RunTimeCellTypes, XLSX.ExcelDataType>([
    ['boolean', 'b'],
    ['string', 's'],
    ['empity', 'z'],
    ['number', 'n'],
    ['date', 'd'],
  ]);

  private _type: RunTimeCellTypes;
  readonly format: CellFormatHandler;

  constructor(
    readonly cell: XLSX.CellObject,
  ) {
    this._type = CellHandler.typeOf(cell.v);
    
    this.format = new CellFormatHandler(this);
  }

  set value(value: V) {
    this._type = CellHandler.typeOf(value);
    this.cell.t = CellHandler.toXLSXType(this._type);
    this.cell.v = value as CellValueType;
  }

  get value(): V {
    return this.cell.v as V;
  }

  static typeOf(value: CellTypeMap[CellTypes]) {
    return Result.unwrap(this.safeTypeOf(value));
  }

  static safeTypeOf(value: CellTypeMap[CellTypes]): ResultType<RunTimeCellTypes> {
    if (value === undefined) return 'empity';

    const constructor = value.constructor;

    return this.CONSTRUCTORS_MAP.get(constructor) ?? ResultError.create(`Unespected type '${constructor.name}'`);
  }

  static getTypeName(type: CellTypes): string {
    return this.TYPE_NAMES.get(type) ?? type;
  }

  static toXLSXType(type: RunTimeCellTypes): XLSX.ExcelDataType {
    return this.XLSX_TYPE_MAP.get(type) ?? 'e';
  }

  static typeTuple<T extends readonly CellTypes[] | []>(tuple: T): T {
    return tuple;
  }

  type() {
    return this._type;
  }

  as<T extends CellTypes>(type: T): CellHandler<CellTypeMap[T]> {
    return Result.unwrap(this.safeAs(type));
  }

  is<T extends CellTypes>(type: T): this is CellHandler<CellTypeMap[T]> {
    return type === 'any' || type.includes(this._type) || (this._type === 'empity' && type.at(-1) === '?');
  }

  safeAs<T extends CellTypes>(type: T): ResultType<CellHandler<CellTypeMap[T]>> {
    return this.is(type) ?
      this :
      ResultError.create(`Can't assign cell with type '${CellHandler.getTypeName(this._type)}' as a '${CellHandler.getTypeName(type)}'`);
  }

  static typeAll<C extends readonly CellHandler[] | [], T extends readonly CellTypes[] | []>(cells: C, types?: T) {
    return Result.unwrap(this.safeTypeAll(cells, types));
  }

  static safeTypeAll<C extends readonly CellHandler[] | [], T extends readonly CellTypes[] | []>(cells: C, types: T = [] as T): ResultType<{ -readonly [K in keyof C]: CellHandler<CellTypeMap[K extends keyof T ? T[K] : CellTypes]> }> {
    for (let i = 0; i < cells.length; i++) {
      const type = types.at(i);
      if (!type) continue;

      const result = cells[i].safeAs(type);
      if (ResultError.isError(result)) return result;
    }

    return cells as { -readonly [K in keyof C]: CellHandler<CellTypeMap[K extends keyof T ? T[K] : CellTypes]> };
  }
}