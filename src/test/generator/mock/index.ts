export abstract class MockFactory<T> {
  abstract create(): T;

  array(size: number): T[] {
    return new Array(size)
      .fill(null)
      .map(() => this.create());
  }
}