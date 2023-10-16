import { Gender } from "../../../../../extra-duty-lib";
import { randomIntFromInterval } from "../../../../../utils";

export const M_NAMES = [
  "João", "Pedro", "Carlos", "José",
  "Rafael", "Luiz", "Lucas", "Mateus",
  "Gustavo", "Daniel", "Felipe", "Bruno",
];

export const F_NAMES = [
  "Ana", "Maria", "Mariana", "Isabela", "Sofia",
  "Camila", "Gabriela", "Julia", "Manuela",
  "Valentina", "Larissa", "Beatriz", "Laura",
];

export const SURNAMES = [
  "Silva", "Santos", "Oliveira", "Pereira",
  "Alves", "Ferreira", "Rodrigues", "Costa",
  "Carvalho", "Gomes", "Martins", "Araujo",
  "Fernandes", "Goncalves", "Dias", "Ribeiro",
  "Pinto", "Cardoso", "Cunha", "Barbosa",
  "Mendes", "Nunes", "Lima", "Barros",
  "Teixeira",
] as ReadonlyArray<string>;

export function getNamesByGender(gender: Gender) {
  switch (gender) {
    case "N/A":
      const choice = Math.random();
      return choice < .5 ? M_NAMES : F_NAMES;
    case "female":
      return F_NAMES;
    case "male":
      return M_NAMES;
  }
}

export function randomName(gender: Gender = 'N/A') {
  const names = getNamesByGender(gender);

  const nameIndex = randomIntFromInterval(0, names.length - 1);
  const surnameIndex = randomIntFromInterval(0, SURNAMES.length - 1);

  return `${names[nameIndex]} ${SURNAMES[surnameIndex]}`;
}