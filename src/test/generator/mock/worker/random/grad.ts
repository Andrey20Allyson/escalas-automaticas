export function randomGrad(): string {
  const choice = Math.random();

  if (choice < .5) return 'GCM';
  if (choice < .8) return 'SI';

  return 'INSP';
}