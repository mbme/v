import { test } from 'tools/test'
import { aesEncrypt, aesDecrypt } from './utils'

test('Encrypt/decrypt', (assert) => {
  const text = 'Some great text: with a colon'
  const password = 'Giant password'
  assert.equal(aesDecrypt(aesEncrypt(text, password), password), text)
})
