import XLSX from 'xlsx';
import { Result, ResultError, error, isError, optional, unwrap } from '../utils/result';

export type CellValue = XLSX.CellObject['v'];

export enum CellValueTypes {
  DATE,
  STRING,
  NUMBER,
  BOOLEAN,
  EMPITY,
}

export interface CellValueTypeMap {
  [CellValueTypes.DATE]: Date,
  [CellValueTypes.STRING]: string,
  [CellValueTypes.NUMBER]: number,
  [CellValueTypes.BOOLEAN]: boolean,
  [CellValueTypes.EMPITY]: undefined,
}

export class CellHandler<V extends CellValueTypeMap[CellValueTypes] = CellValueTypeMap[CellValueTypes]> {
  static readonly CONSTRUCTORS_MAP: ReadonlyMap<Function, CellValueTypes> = new Map([
    [Date, CellValueTypes.DATE],
    [Number, CellValueTypes.NUMBER],
    [Boolean, CellValueTypes.BOOLEAN],
    [String as Function, CellValueTypes.STRING],
  ]);

  static readonly TYPE_NAMES: ReadonlyMap<CellValueTypes, string> = new Map([
    [CellValueTypes.DATE, 'date'],
    [CellValueTypes.NUMBER, 'number'],
    [CellValueTypes.STRING, 'string'],
    [CellValueTypes.BOOLEAN, 'boolean'],
    [CellValueTypes.EMPITY, 'undefined'],
  ]);

  static readonly XLSX_TYPE_MAP: ReadonlyMap<CellValueTypes, XLSX.ExcelDataType> = new Map([
    [CellValueTypes.BOOLEAN, 'b'],
    [CellValueTypes.DATE, 'd'],
    [CellValueTypes.EMPITY, 'z'],
    [CellValueTypes.NUMBER, 'n'],
    [CellValueTypes.STRING, 's'],
  ]);

  private _type: CellValueTypes;

  constructor(
    readonly cell: XLSX.CellObject,
  ) {
    this._type = CellHandler.typeOf(cell.v);
  }

  set value(value: V) {
    this._type = CellHandler.typeOf(value);
    this.cell.t = CellHandler.toXLSXType(this._type);

    this.cell.v = value as CellValue;
  }

  get value(): V {
    return this.cell.v as V;
  }

  static typeOf(value: CellValueTypeMap[CellValueTypes]) {
    return unwrap(this.safeTypeOf(value));
  }

  static safeTypeOf(value: CellValueTypeMap[CellValueTypes]): Result<CellValueTypes> {
    if (value === undefined) return CellValueTypes.EMPITY;

    const constructor = value.constructor;

    return this.CONSTRUCTORS_MAP.get(constructor) ?? error(`Unespected type '${constructor.name}'`);
  }

  static getTypeName(type: CellValueTypes): string {
    return this.TYPE_NAMES.get(type) ?? 'unknown';
  }

  static toXLSXType(type: CellValueTypes): XLSX.ExcelDataType {
    return this.XLSX_TYPE_MAP.get(type) ?? 'e';
  }

  type() {
    return this._type;
  }

  as<T extends CellValueTypes>(type: T): CellHandler<CellValueTypeMap[T]> {
    return unwrap(this.safeAs(type));
  }

  safeAs<T extends CellValueTypes>(type: T): Result<CellHandler<CellValueTypeMap[T]>> {
    if (this._type === type) return this as unknown as Result<CellHandler<CellValueTypeMap[T]>>;

    return error(`Can't assign cell with type '${this._type}' as a '${type}'`);
  }

  asOptional<T extends CellValueTypes>(type: T): CellHandler<CellValueTypeMap[T] | undefined> {
    return unwrap(this.asSafeOptional(type));
  }

  asSafeOptional<T extends CellValueTypes>(type: T): Result<CellHandler<CellValueTypeMap[T] | undefined>> {
    if (this.value === undefined || this._type === type) return this as Result<CellHandler<CellValueTypeMap[T] | undefined>>;

    return error(`Can't assign cell with type '${this._type}' as a '${type}'`);
  }
}