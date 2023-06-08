export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomizeArray<T>(array: T[], mutate = false): T[] {
  let newArray = mutate ? array : Array.from(array);

  for (let i = 0; i < newArray.length; i++) {
    const randIndex = randomIntFromInterval(0, newArray.length - 1);

    const temp = newArray[i];
    newArray[i] = newArray[randIndex];
    newArray[randIndex] = temp; 
  }

  return newArray;
}