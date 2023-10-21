export type CliFlagParamType = number | string;

export class CliController {
  constructor(
    readonly args: string[],
    readonly flags: Map<string, CliFlagParamType>,
  ) { }

  hasFlag(name: string, alias?: string): boolean {
    if (this.flags.has(name)) {
      return true;
    }

    return alias !== undefined ? this.flags.has(alias) : false;
  }

  optionalFlag(name: string, alias?: string): CliFlagParam | undefined {
    const value = this.flags.get(name);

    if (value === undefined) {
      if (alias !== undefined) {
        return this.optionalFlag(alias);
      }

      return undefined;
    }

    return new CliFlagParam(name, value);
  }

  flag(name: string, alias?: string): CliFlagParam {
    const flag = this.optionalFlag(name, alias);

    if (flag === undefined) {
      throw new RequiredFlagError(name);
    }

    return flag;
  }

  arg(index: number): string {
    const arg = this.args.at(index);

    if (arg === undefined) {
      throw new RequiredArgError(index);
    }

    return arg;
  }
}

export class FlagTypeError extends Error {
  constructor(flag: string, expectedType: string, recived: string) {
    super(`flag ${JSON.stringify(flag)} expected a ${expectedType} as type, but recived ${recived}`);
  }
}

export class FlagAsEnumTypeError extends Error {
  constructor(flag: string, expected: string[], recived: CliFlagParamType) {
    const expectedString = expected.map(s => JSON.stringify(s)).join(', ');

    super(`flag ${JSON.stringify(flag)} expected a member of enum [${expectedString}] but recived ${JSON.stringify(recived)}`);
  }
}

export class RequiredFlagError extends Error {
  constructor(flag: string) {
    super(`flag ${JSON.stringify(flag)} is required`);
  }
}

export class RequiredArgError extends Error {
  constructor(index: number) {
    super(`arg ${index} is required`);
  }
}

export class CliFlagParam {
  constructor(
    readonly flag: string,
    readonly value: CliFlagParamType,
  ) { }

  asEnum<U extends string, E extends [U, ...U[]]>(values: E): E[number] {
    if (typeof this.value !== 'string' || !values.includes(this.value as U)) {
      throw new FlagAsEnumTypeError(this.flag, values, this.value);
    }

    return this.value as E[number];
  }

  asString(): string {
    if (typeof this.value === 'number') {
      return this.value.toString();
    }

    return this.value;
  }

  asNumber(): number {
    if (typeof this.value !== 'number') {
      throw new FlagTypeError(this.flag, 'number', typeof this.value);
    }

    return this.value;
  }
}

export interface ArgvCompiler {
  compile(): CliController;
}

export class DefaultArgvCompiler implements ArgvCompiler {
  private _index?: number;
  private _flags?: Map<string, CliFlagParamType>;
  private _args?: string[];
  private args: string[];

  constructor(argv: string[]) {
    this.args = argv.slice(2);
  }

  compile(): CliController {
    this._init();
    this._compile();

    const controller = this._createController();

    this._clear();

    return controller;
  }

  private _init() {
    this._index = 0;
    this._flags = new Map();
    this._args = [];
  }

  private _createController() {
    return new CliController(this._getArgs(), this._getFlags());
  }

  private _clear() {
    delete this._args;
    delete this._flags;
    delete this._index;
  }

  private _throwNotInitialiedError(): never {
    throw new Error('compile time properties hasn\'t initialized yet');
  }

  private _getArgs() {
    return this._args ?? this._throwNotInitialiedError();
  }

  private _getFlags() {
    return this._flags ?? this._throwNotInitialiedError();
  }

  private _getIndex() {
    return this._index ?? this._throwNotInitialiedError();
  }

  private _setIndex(index: number) {
    if (this._index === undefined) {
      this._throwNotInitialiedError();
    }

    this._index = index;
  }

  private _addArgOrFlag(argOrFlag: string) {
    if (this._isFlag(argOrFlag)) {
      return this._addRawFlag(argOrFlag);
    }

    this._addArg(argOrFlag);
  }

  private _addArg(arg: string) {
    this._getArgs().push(arg);
  }

  private _addRawFlag(rawFlag: string) {
    const flag = this._parseFlag(rawFlag);

    const nextArg = this._next();

    if (!nextArg || this._isFlag(nextArg)) {
      this._setFlag(flag, '');
      this._goBack();
    } else {
      this._setFlag(flag, nextArg);
    }
  }

  private _setFlag(flag: string, rawArg: string) {
    const flagParam = this._parseFlagParam(rawArg);

    this._getFlags().set(flag, flagParam);
  }

  private *_iterArgs(): Iterable<string> {
    while (true) {
      const arg = this._next();
      if (arg === undefined) break;

      yield arg;
    }

    this._setIndex(0);
  }

  private _compile() {
    for (const arg of this._iterArgs()) {
      this._addArgOrFlag(arg);
    }
  }

  private _goBack(step: number = 1) {
    this._setIndex(this._getIndex() - step);
  }

  private _next() {
    const currentIndex = this._getIndex();
    const arg = this.args.at(currentIndex);
    this._setIndex(currentIndex + 1);

    return arg;
  }

  private _isFlag(arg: string): boolean {
    return arg.startsWith('-') || arg.startsWith('--');
  }

  private _parseFlag(arg: string): string {
    const nameStart = arg[1] === '-' ? 2 : 1;

    return arg.slice(nameStart);
  }

  private _parseFlagParam(value: string): number | string {
    if (value.length === 0) return value;

    const numberValue = Number(value);

    if (!isNaN(numberValue)) {
      return numberValue;
    } else {
      return value;
    }
  }
}

function getProcess(): NodeJS.Process | null {
  if (globalThis.process === undefined) {
    return null;
  }

  return globalThis.process;
}

export const argvCompiler: ArgvCompiler = new DefaultArgvCompiler(getProcess()?.argv ?? []);