import assert from 'assert';
import axios from 'axios';

// Basic integration test that the server responds to a status check. This
// assumes the server is running on localhost:10000. In CI you may spin up
// the server before executing this test.

async function run() {
  const res = await axios.get('http://localhost:10000/api/servers', { validateStatus: () => true });
  // Expect unauthenticated request to be rejected
  assert.strictEqual(res.status, 401);
  console.log('✅ Integration test passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});