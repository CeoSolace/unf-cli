import assert from 'assert';
import { generateKeyPair, encryptMessage, decryptMessage } from '../core/crypto';
import { obfuscateId } from '../core/security';
import { randomId } from '../core/utils';

async function runTests() {
  console.log('🔬 Running unit tests...');
  // Test encryption/decryption
  const message = new TextEncoder().encode('hello world');
  const alice = generateKeyPair();
  const bob = generateKeyPair();
  const cipher = await encryptMessage(message, bob.publicKey, alice.secretKey);
  const plain = await decryptMessage(cipher, alice.publicKey, bob.secretKey);
  assert(plain, 'Decryption should return a value');
  assert.strictEqual(new TextDecoder().decode(plain!), 'hello world', 'Decrypted message should equal original');
  console.log('✅ Encryption/decryption test passed');
  // Test ID obfuscation determinism
  const id = randomId(8);
  const obf1 = obfuscateId(id);
  const obf2 = obfuscateId(id);
  assert.strictEqual(obf1, obf2, 'Obfuscation must be deterministic');
  console.log('✅ ID obfuscation test passed');
  // Test randomId uniqueness
  const set = new Set<string>();
  for (let i = 0; i < 100; i++) {
    set.add(randomId());
  }
  assert.strictEqual(set.size, 100, 'randomId should produce unique values');
  console.log('✅ randomId uniqueness test passed');
  console.log('🎉 All tests passed');
}

runTests().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});