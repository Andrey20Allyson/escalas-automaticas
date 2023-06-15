export function firstNumberIndex(string: string) {
  for (let i = 1; i < string.length; i++) {
    const charCode = string.charCodeAt(i);

    if (charCode >= 48 && charCode <= 57) return i;
  }

  return -1;
}