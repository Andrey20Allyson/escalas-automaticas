import { describe, expect, test } from "vitest";
import { removeFromArrayWhere } from "../../../utils";

describe('array-utils', () => {
  describe(removeFromArrayWhere.name, () => {
    test('Shold remove the required values mutating the array', () => {
      const array = [1, 2, 3, 4, 5, 6];
      
      removeFromArrayWhere(array, num => num > 3);

      expect(array)
        .toEqual([1, 2, 3]);

      expect(array.at(3))
        .toBeUndefined();
    });

    test(`Shold remove all itens in the array if predicate always returns true`, () => {
      const array = [1, 2, 3, 4, 5, 6];

      removeFromArrayWhere(array, () => true);

      expect(array.length)
        .toStrictEqual(0);
    });
  });
})