import { test } from 'tools/test';
import { flattenStyles } from './styles';

test('flattenStyles', (assert) => {
  assert.deepEqual(
    flattenStyles({
      x: 1,
    }),
    [
      {
        x: 1,
      },
    ],
  );

  assert.deepEqual(
    flattenStyles({
      x: 1,
      extend: [
        {
          y: 1,
        },
      ],
    }),
    [
      {
        x: 1,
      },
      {
        y: 1,
      },
    ],
  );

  // nested extend
  assert.deepEqual(
    flattenStyles({
      x: 1,
      extend: [
        {
          y: 1,
          extend: [
            {
              z: 1,
            },
          ],
        },
      ],
    }),
    [
      {
        x: 1,
      },
      {
        y: 1,
      },
      {
        z: 1,
      },
    ],
  );

  // condition
  assert.deepEqual(
    flattenStyles({
      x: 1,
      extend: [
        {
          condition: false,
          y: 1,
        },
      ],
    }),
    [
      {
        x: 1,
      },
    ],
  );

  assert.deepEqual(
    flattenStyles({
      condition: false,
      x: 1,
      extend: [
        {
          y: 1,
        },
      ],
    }),
    [],
  );
});
