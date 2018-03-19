import { test } from 'tools/test';
import { PlatformBuffer } from 'server/utils/platform';
import { serialize, parse } from './protocol';

const buffer = Buffer.from('test file');

test('serialization', (assert) => {
  const action = { name: 'TEST' };
  const files = [ buffer, buffer ];
  assert.matchSnapshot(serialize(action, files, PlatformBuffer).toString('utf8'));
});

test('deserialization', (assert) => {
  { // parse action
    const action = {
      name: 'TEST',
      data: { x: 1 },
    };

    const result = parse(serialize(action, [], PlatformBuffer));
    assert.equal(result.files.length, 0);
    assert.deepEqual(result.action, action);
  }

  { // parse action with files
    const action = { name: 'TEST' };
    const files = [ buffer, buffer ];

    const result = parse(serialize(action, files, PlatformBuffer));
    assert.deepEqual(result.action, action);
    assert.equal(result.files.length, files.length);

    for (const file of result.files) {
      assert.equal(file.equals(buffer), true);
    }
  }
});
