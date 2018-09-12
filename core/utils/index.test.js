import { test } from '../../tester';
import { aesEncrypt, aesDecrypt } from './index';

test('Encrypt/decrypt', (assert) => {
  const text = 'Some great text: with a colon';
  const password = 'Giant password';
  assert.equal(aesDecrypt(aesEncrypt(text, password), password), text);
});
