const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

const BACKENDS = {
  '/api/users': { host: 'localhost', port: 3001, pathPrefix: '/api/users' },
  '/api/products': { host: 'localhost', port: 3002, pathPrefix: '/api/products' },
  '/api/orders': { host: 'localhost', port: 8000, pathPrefix: '/api/orders' }
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function proxyRequest(req, res, targetConfig, targetPath) {
  const options = {
    hostname: targetConfig.host,
    port: targetConfig.port,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${targetConfig.host}:${targetConfig.port}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error to ${targetConfig.host}:${targetConfig.port}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', message: `Could not connect to service on port ${targetConfig.port}`, details: err.message }));
  });

  req.pipe(proxyReq, { end: true });
}

function checkServiceHealth(port, pathStr) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: pathStr,
      method: 'GET',
      timeout: 1500
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          port,
          status: res.statusCode === 200 ? 'healthy' : 'degraded',
          code: res.statusCode,
          response: data ? (data.startsWith('{') ? JSON.parse(data) : data) : null
        });
      });
    });
    req.on('error', () => resolve({ port, status: 'offline', code: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ port, status: 'timeout', code: 0 }); });
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    });
    return res.end();
  }

  // Unified System Health API
  if (pathname === '/health' || pathname === '/api/health-summary') {
    const [userH, productH, orderH] = await Promise.all([
      checkServiceHealth(3001, '/health'),
      checkServiceHealth(3002, '/health'),
      checkServiceHealth(8000, '/health')
    ]);

    const isAllHealthy = userH.status === 'healthy' && productH.status === 'healthy' && orderH.status === 'healthy';

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      status: isAllHealthy ? 'UP' : 'PARTIAL',
      gateway: 'Nginx-Simulated-NodeGateway',
      timestamp: new Date().toISOString(),
      services: {
        'user-service': userH,
        'product-service': productH,
        'order-service': orderH
      }
    }));
  }

  // Check Proxy Routes
  for (const [prefix, config] of Object.entries(BACKENDS)) {
    if (pathname.startsWith(prefix)) {
      return proxyRequest(req, res, config, req.url);
    }
  }

  // Serve Static UI Assets
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 Microservices Gateway & Dashboard Active!`);
  console.log(`  🔗 Portal URL: http://localhost:${PORT}`);
  console.log(`  🎯 Proxies:`);
  console.log(`     /api/users    -> http://localhost:3001`);
  console.log(`     /api/products -> http://localhost:3002`);
  console.log(`     /api/orders   -> http://localhost:8000`);
  console.log(`     /health       -> Unified Health Aggregator`);
  console.log(`====================================================`);
});
