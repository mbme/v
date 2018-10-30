import { test } from '../tester';

import ReplicaDB from './replica';
import InMemStorage from './replica-in-mem-storage';

function initDB(remote, local) {
  const storage = new InMemStorage();
  storage._rev = remote - 1;
  for (let i = 0; i < remote; i += 1) {
    storage._records.push({ _id: i, _rev: i });
  }

  for (let i = 0; i < local; i += 1) {
    const id = `localid-${i}`;
    storage._localRecords[id] = { _id: id };
  }

  return new ReplicaDB(storage);
}

test('getAll', (assert) => {
  const db = initDB(2, 1);
  const records = db.getAll();

  assert.equal(records.length, 3);
});
