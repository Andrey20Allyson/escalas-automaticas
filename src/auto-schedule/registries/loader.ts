export class LoaderOptions {
  static ids(ids: number[]) {

  }
}

export interface Loader<T> {
  load(options?: LoaderOptions): Promise<T>;
}