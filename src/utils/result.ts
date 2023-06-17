export type ResultType<R, E extends ResultError = ResultError> = R | E;
export type SuccessResult<R> = R extends ResultError ? never : R;
export type FailResult<R> = R extends ResultError ? R : never;

const ResultErrorType = Symbol();
const CreateError = Symbol();

export class ResultError {
  readonly type = ResultErrorType;
  constructor(readonly message?: string) { }

  [CreateError]() {
    const error = new Error(this.message);
    error.name = this.constructor.name;

    return error;
  }

  static isError(result: ResultType<unknown>): result is ResultError {
    return result instanceof ResultError;
  }

  static create(value?: unknown) {
    return new ResultError(String(value));
  }
}

export abstract class Result {
  /**
   * @throws Error if result is instance of ResultError
   */
  static unwrap<T>(result: ResultType<T>): T {
    if (ResultError.isError(result)) throw result[CreateError]();
    return result as T;
  }
  
  static all<R extends readonly unknown[] | []>(results: R): ResultType<{ -readonly[K in keyof R]: SuccessResult<R[K]> }, FailResult<R[keyof R]>> {
    for (let i = 0; i < results.length; i++) {
      if (ResultError.isError(results[i])) return results[i] as FailResult<R[keyof R]>;
    }
  
    return results as { -readonly[K in keyof R]: SuccessResult<R[K]> };
  }
  
  static optional<T>(result: ResultType<T>): T | null {
    return ResultError.isError(result) ? null : result as T;
  }
}