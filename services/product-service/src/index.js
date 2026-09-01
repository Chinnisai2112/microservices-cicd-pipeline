const express = require('express');
const promClient = require('prom-client');
const { products, findProduct, createProduct, deleteProduct } = require('./store');

const app = express();
const PORT = process.env.PORT || 3002;

promClient.collectDefaultMetrics({ prefix: 'product_service_' });

const httpRequestDuration = new promClient.Histogram({
  name: 'product_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'product-service' });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/api/products', (_req, res) => {
  res.json({ data: products });
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ data: product });
});

app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || price == null || !category) {
    return res.status(400).json({ error: 'name, price, and category are required' });
  }
  const product = createProduct({ name, price: Number(price), category });
  res.status(201).json({ data: product });
});

app.delete('/api/products/:id', (req, res) => {
  const deleted = deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Product service listening on port ${PORT}`);
  });
}

module.exports = app;
