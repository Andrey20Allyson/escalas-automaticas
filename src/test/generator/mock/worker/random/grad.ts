import { Graduation } from "../../../../../extra-duty-lib";

export function randomGrad(): Graduation {
  const choice = Math.random();

  if (choice < .5) return 'gcm';
  if (choice < .8) return 'sub-insp';

  return 'insp';
}