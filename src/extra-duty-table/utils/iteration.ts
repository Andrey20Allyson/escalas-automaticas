export function* iterRange(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}