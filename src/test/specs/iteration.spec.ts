import { test, expect } from 'vitest';
import { iterRange } from '../../utils/iteration';

test(`#iterRange return when passed to array shold have the length of 'end' - 'start'`, () => {
  const array = Array.from(iterRange(0, 50));

  expect(array.length).toStrictEqual(50);
});