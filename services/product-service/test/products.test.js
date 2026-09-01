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

describe('Product Service', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'product-service');
  });

  it('GET /api/products returns product list', async () => {
    const res = await request('GET', '/api/products');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  it('POST /api/products creates a new product', async () => {
    const res = await request('POST', '/api/products', {
      name: 'Mechanical Keyboard',
      price: 89.99,
      category: 'Accessories'
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Mechanical Keyboard');
  });

  it('GET /api/products/:id returns single product', async () => {
    const res = await request('GET', '/api/products/1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, '1');
  });
});
