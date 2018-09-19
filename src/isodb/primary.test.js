import { test } from '../tester';
import PrimaryDB from './primary';
import InMemStorage from './primary-in-mem-storage';

test('Storage', (assert) => {
  const db = new PrimaryDB(new InMemStorage());
});
