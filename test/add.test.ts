import {expect, test} from 'vitest';

import {add} from '../src';

test('adds', () => {
  expect(add(1, 1)).toEqual(2);
});
