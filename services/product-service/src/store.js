const products = [
  { id: '1', name: 'Laptop Pro', price: 1299.99, category: 'Electronics' },
  { id: '2', name: 'Wireless Mouse', price: 29.99, category: 'Accessories' },
  { id: '3', name: 'USB-C Hub', price: 49.99, category: 'Accessories' }
];

let nextId = 4;

function findProduct(id) {
  return products.find((p) => p.id === id);
}

function createProduct({ name, price, category }) {
  const product = { id: String(nextId++), name, price, category };
  products.push(product);
  return product;
}

function deleteProduct(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

module.exports = { products, findProduct, createProduct, deleteProduct };
