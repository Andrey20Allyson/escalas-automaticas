export type Result<R, E extends ResultError = ResultError> = R | E;

const ResultErrorType = Symbol();

export class ResultError {
  readonly type = ResultErrorType;
  constructor(readonly message?: string) { }

  createError() {
    const error = new Error(this.message);
    error.name = this.constructor.name;

    return error;
  }
}

export function unwrap<T>(result: Result<T>): T {
  if (isError(result)) throw result.createError();
  return result as T;
}

export function resultFrom<T, E extends ResultError>(results: Result<T, E>[]): Result<T[], E> {
  for (let i = 0; i < results.length; i++) {
    if (isError(results[i])) return results[i] as E;
  }

  return results as T[];
}

export function error(message?: string) {
  return new ResultError(message);
}

export function isError(result: Result<unknown>): result is ResultError {
  return result instanceof ResultError;
}

export function optional<T>(result: Result<T>): T | null {
  return isError(result) ? null : result as T;
}