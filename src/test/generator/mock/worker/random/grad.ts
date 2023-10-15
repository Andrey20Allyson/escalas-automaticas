export function randomGrad(): string {
  const choice = Math.random();

  if (choice < .6) return 'GCM';
  if (choice < .75) return 'SI';

  return 'INSP';
}