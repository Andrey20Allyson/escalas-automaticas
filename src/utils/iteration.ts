import { randomizeArray } from "./random";

export function* iterRange(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

export function* enumerate<T>(iter: Iterable<T>): Iterable<[number, T]> {
  let i = 0;
  if (!iter) return;

  for (const entry of iter) {
    yield [i++, entry];
  }
}

export function iterRandomInRange(start: number, end: number): Iterable<number> {
  const array = Array.from(iterRange(start, end));

  return randomizeArray(array, true)[Symbol.iterator]();
}

export function* iterRandom<T>(iter: Iterable<T> | ArrayLike<T>): Iterable<T> {
  if (!iter) return;

  if ('length' in iter) {
    for (const i of iterRandomInRange(0, iter.length)) {
      yield iter[i];
    }
  } else {
    let array = randomizeArray(Array.from(iter), true);

    for (const item of array) {
      yield item;
    }
  }
}