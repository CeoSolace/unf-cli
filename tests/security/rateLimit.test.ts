import axios from 'axios';

// This test attempts to trigger the rate limiter by making a large number
// of requests in quick succession. The server should respond with HTTP 429.

async function run() {
  const url = 'http://localhost:10000/api/auth/login';
  let rateLimited = false;
  for (let i = 0; i < 70; i++) {
    const res = await axios.post(url, { username: 'invalid', password: 'invalid' }, { validateStatus: () => true });
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  if (!rateLimited) {
    console.error('❌ Rate limiting test failed: no 429 received');
    process.exit(1);
  }
  console.log('✅ Rate limiting test passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});