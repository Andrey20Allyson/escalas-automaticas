export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function _randomizeArray<T>(array: T[], mutate = false): T[] {
  let newArray = mutate ? array : Array.from(array);

  for (let i = 0; i < newArray.length; i++) {
    const randIndex = randomIntFromInterval(0, newArray.length - 1);

    const temp = newArray[i];
    newArray[i] = newArray[randIndex];
    newArray[randIndex] = temp;
  }

  return newArray;
}

export function randomizeArray<T>(array: T[], mutates: boolean = false): T[] {
  let newArray = mutates ? array : Array.from(array);
  const n = newArray.length;

  for (let i = n - 1; i > 0; i--) {
    const j = randomIntFromInterval(0, i);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export module random {
  export function array<T>(array: T[], mutates: boolean = false): T[] {
    return randomizeArray(array, mutates);
  }

  export function bool(trueRatio = .5): boolean {
    return Math.random() < trueRatio ? true : false;
  }

  export function int(min: number, max: number): number {
    return randomIntFromInterval(min, max);
  }
}