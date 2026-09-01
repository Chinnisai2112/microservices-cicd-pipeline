const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

let server;
let baseUrl;

before(async () => {
  const app = require('../src/index');
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server.close();
});

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(url, { method, headers: { 'Content-Type': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('User Service', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'user-service');
  });

  it('GET /api/users returns user list', async () => {
    const res = await request('GET', '/api/users');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
  });

  it('POST /api/users creates a new user', async () => {
    const res = await request('POST', '/api/users', { name: 'Charlie', email: 'charlie@example.com' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Charlie');
  });

  it('POST /api/users rejects missing fields', async () => {
    const res = await request('POST', '/api/users', { name: 'No Email' });
    assert.equal(res.status, 400);
  });
});
