export function firstNumberIndex(string: string) {
  for (let i = 1; i < string.length; i++) {
    const charCode = string.charCodeAt(i);

    if (charCode >= 48 && charCode <= 57) return i;
  }

  return -1;
}

const zeroCharCode = '0'.charCodeAt(0);
const nineCharCode = '9'.charCodeAt(0);

export function isDigit(char: string, index: number = 0) {
  const charCode = char.charCodeAt(index);

  return charCode >= zeroCharCode &&
    charCode <= nineCharCode;
}