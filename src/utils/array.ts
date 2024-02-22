export function forkArray<T>(array: Array<T>, separator: (value: T) => boolean): [true: T[], false: T[]] {
  let falseArray = [];
  let trueArray = [];

  for (let item of array) {
    if (separator(item)) {
      trueArray.push(item);
    } else {
      falseArray.push(item);
    }
  }

  return [trueArray, falseArray]
}

export type FilterPredicate<T> = (value: T, index: number, array: T[]) => boolean;

export function removeFromArrayWhere<T>(array: T[], predicate: FilterPredicate<T>, thisArg: unknown = undefined): T[] {
  let insertionIdx = 0;
  
  for (let i = 0; i < array.length; i++) {
    const value = array[i];

    if (predicate.call(thisArg, value, i, array) === true) {
      continue;
    }

    array[insertionIdx++] = value;
  }

  array.length = insertionIdx;

  return array;
}