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