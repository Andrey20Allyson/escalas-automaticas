export function parseNumberOrThrow(value?: unknown) {
  const num = Number(value);
  if (isNaN(num)) throw new Error(`Can't parse "${value}" because results in NaN!`);
  return num;
}

export function isInteger(value: number) {
  return value % 1 === 0;
}