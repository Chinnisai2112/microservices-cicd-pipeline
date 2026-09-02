// State
let appState = {
  users: [],
  products: [],
  orders: [],
  health: {
    userService: 'unknown',
    productService: 'unknown',
    orderService: 'unknown'
  }
};

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initData();
  initAutoPoll();
});

// Switch Tabs
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });

  document.getElementById('btnRefreshAll').addEventListener('click', () => {
    initData();
    showToast('Dashboard data refreshed!', 'success');
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
}

// Initial Data Fetch
async function initData() {
  await Promise.all([
    checkAllHealth(),
    fetchUsers(),
    fetchProducts(),
    fetchOrders()
  ]);
  updateMetrics();
  renderCheckoutUserSelect();
  if (document.querySelectorAll('.order-item-row').length === 0) {
    addOrderItemRow();
  }
}

// Health Polling
function initAutoPoll() {
  setInterval(checkAllHealth, 8000);
}

async function checkAllHealth() {
  try {
    const res = await fetch('/health');
    if (res.ok) {
      const data = await res.json();
      updateHealthUI('user-service', data.services?.['user-service']?.status === 'healthy');
      updateHealthUI('product-service', data.services?.['product-service']?.status === 'healthy');
      updateHealthUI('order-service', data.services?.['order-service']?.status === 'healthy');

      const allUp = data.status === 'UP';
      const pill = document.getElementById('clusterStatusPill');
      const pillText = document.getElementById('clusterStatusText');
      if (allUp) {
        pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        pill.style.color = '#10b981';
        pillText.textContent = 'Cluster Online (3/3 Healthy)';
        document.getElementById('metricActiveServices').textContent = '3 / 3';
      } else {
        pill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        pill.style.color = '#f59e0b';
        pillText.textContent = 'Cluster Degraded';
      }
    }
  } catch (err) {
    console.error('Error fetching health summary:', err);
  }
}

function updateHealthUI(serviceName, isHealthy) {
  const tag = document.getElementById(`tag-${serviceName}`);
  if (!tag) return;
  if (isHealthy) {
    tag.className = 'status-indicator-tag healthy';
    tag.innerHTML = '<span class="status-dot"></span> Online (200 OK)';
  } else {
    tag.className = 'status-indicator-tag offline';
    tag.innerHTML = '<span class="status-dot"></span> Offline';
  }
}

async function testHealth(port, serviceName) {
  try {
    const start = performance.now();
    const res = await fetch(`http://localhost:${port}/health`);
    const duration = Math.round(performance.now() - start);
    if (res.ok) {
      showToast(`${serviceName} healthy! Response time: ${duration}ms`, 'success');
      updateHealthUI(serviceName, true);
    } else {
      showToast(`${serviceName} returned status ${res.status}`, 'error');
    }
  } catch (err) {
    showToast(`Cannot reach ${serviceName} on port ${port}`, 'error');
    updateHealthUI(serviceName, false);
  }
}

// ----------------- USERS -----------------
async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    appState.users = json.data || [];
    renderUsers();
    document.getElementById('usersJsonBlock').textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    console.error('Error fetching users:', err);
    document.getElementById('usersJsonBlock').textContent = `// Error fetching users: ${err.message}`;
  }
}

function renderUsers() {
  const grid = document.getElementById('usersGrid');
  grid.innerHTML = '';
  document.getElementById('metricTotalUsers').textContent = appState.users.length;

  if (appState.users.length === 0) {
    grid.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-dim);">No users found. Click "Add New User" to create one.</div>';
    return;
  }

  appState.users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'glass-card user-card';
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    card.innerHTML = `
      <div class="user-avatar">${initials}</div>
      <div class="user-info">
        <div class="user-name">${escapeHtml(user.name)}</div>
        <div class="user-email">${escapeHtml(user.email)}</div>
        <span class="user-id-badge">ID: ${user.id}</span>
      </div>
      <button class="btn-delete-user" title="Delete User" onclick="deleteUser('${user.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;
    grid.appendChild(card);
  });
}

async function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  if (!name || !email) return;

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create user');
    showToast(`User "${name}" created successfully!`, 'success');
    closeModal('modalCreateUser');
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    await fetchUsers();
    renderCheckoutUserSelect();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm(`Are you sure you want to delete user #${id}?`)) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete user');
    showToast(`User #${id} removed.`, 'success');
    await fetchUsers();
    renderCheckoutUserSelect();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- PRODUCTS -----------------
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    appState.products = json.data || [];
    renderProducts();
    document.getElementById('productsJsonBlock').textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    console.error('Error fetching products:', err);
    document.getElementById('productsJsonBlock').textContent = `// Error fetching products: ${err.message}`;
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  document.getElementById('metricTotalProducts').textContent = appState.products.length;

  const categoryFilter = document.getElementById('filterProductCategory')?.value || 'all';
  const filtered = categoryFilter === 'all' 
    ? appState.products 
    : appState.products.filter(p => p.category === categoryFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-dim);">No products match your filter. Click "Add New Product" to add.</div>';
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'glass-card product-card';
    card.innerHTML = `
      <div class="product-header">
        <span class="product-category-pill">${escapeHtml(product.category || 'General')}</span>
        <span class="user-id-badge">ID: ${product.id}</span>
      </div>
      <h3 class="product-title">${escapeHtml(product.name)}</h3>
      <div class="product-price-row">
        <span class="product-price">$${Number(product.price).toFixed(2)}</span>
      </div>
      <div class="product-card-actions">
        <button class="btn-sm btn-subtle" onclick="quickAddToCheckout('${product.id}')">+ Add to Checkout</button>
        <button class="btn-delete-user" title="Delete Product" onclick="deleteProduct('${product.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterProducts() {
  renderProducts();
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const name = document.getElementById('newProductName').value.trim();
  const price = parseFloat(document.getElementById('newProductPrice').value);
  const category = document.getElementById('newProductCategory').value;
  if (!name || isNaN(price)) return;

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to add product');
    showToast(`Product "${name}" added to catalog!`, 'success');
    closeModal('modalCreateProduct');
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    await fetchProducts();
    updateOrderItemsOptions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm(`Are you sure you want to delete product #${id}?`)) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete product');
    showToast(`Product #${id} removed.`, 'success');
    await fetchProducts();
    updateOrderItemsOptions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- ORDERS & CHECKOUT -----------------
async function fetchOrders() {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    appState.orders = json.data || [];
    renderOrders();
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
}

function renderOrders() {
  const container = document.getElementById('ordersList');
  container.innerHTML = '';
  document.getElementById('ordersCountBadge').textContent = `${appState.orders.length} Orders`;
  document.getElementById('metricTotalOrders').textContent = appState.orders.length;

  let totalRev = 0;
  appState.orders.forEach(o => {
    totalRev += (Number(o.total) || 0);
  });
  document.getElementById('metricTotalRevenue').textContent = `$${totalRev.toFixed(2)} Gross Volume`;

  if (appState.orders.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding: 24px; text-align: center; color: var(--text-dim);">No orders dispatched yet. Use the checkout form to place an order!</div>';
    return;
  }

  // Render recent first
  [...appState.orders].reverse().forEach(order => {
    const card = document.createElement('div');
    card.className = 'glass-card order-card';
    
    let itemsHtml = (order.items || []).map(item => `
      <div class="order-item-chip">
        <span>${escapeHtml(item.product_name || `Product #${item.product_id}`)} × ${item.quantity}</span>
        <span>$${Number(item.subtotal || 0).toFixed(2)}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="order-card-header">
        <span class="order-id">Order #${order.id}</span>
        <span class="order-status-badge status-pending">${order.status || 'Dispatched'}</span>
      </div>
      <div class="order-items-preview">
        ${itemsHtml}
      </div>
      <div class="order-card-footer">
        <span>User ID: <code class="code-val">${order.user_id}</code></span>
        <span class="order-total-val">$${Number(order.total).toFixed(2)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCheckoutUserSelect() {
  const select = document.getElementById('orderUserSelect');
  select.innerHTML = '<option value="">-- Choose Purchasing User --</option>';
  appState.users.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.id;
    opt.textContent = `${user.name} (${user.email})`;
    select.appendChild(opt);
  });
}

function addOrderItemRow(selectedProductId = '') {
  const builder = document.getElementById('orderItemsBuilder');
  const row = document.createElement('div');
  row.className = 'order-item-row';

  let productOptions = appState.products.map(p => `
    <option value="${p.id}" ${p.id == selectedProductId ? 'selected' : ''}>${escapeHtml(p.name)} ($${Number(p.price).toFixed(2)})</option>
  `).join('');

  row.innerHTML = `
    <select class="form-control select-order-product" onchange="calculateCheckoutTotal()" required>
      <option value="">-- Choose Product --</option>
      ${productOptions}
    </select>
    <input type="number" class="form-control input-order-qty" value="1" min="1" max="99" onchange="calculateCheckoutTotal()" oninput="calculateCheckoutTotal()" required>
    <button type="button" class="btn-delete-user" onclick="removeOrderItemRow(this)" title="Remove item">✕</button>
  `;
  builder.appendChild(row);
  calculateCheckoutTotal();
}

function removeOrderItemRow(btn) {
  const row = btn.closest('.order-item-row');
  const allRows = document.querySelectorAll('.order-item-row');
  if (allRows.length > 1) {
    row.remove();
    calculateCheckoutTotal();
  } else {
    showToast('At least one item is required in the order.', 'error');
  }
}

function updateOrderItemsOptions() {
  document.querySelectorAll('.select-order-product').forEach(select => {
    const currentVal = select.value;
    let productOptions = '<option value="">-- Choose Product --</option>' + appState.products.map(p => `
      <option value="${p.id}" ${p.id == currentVal ? 'selected' : ''}>${escapeHtml(p.name)} ($${Number(p.price).toFixed(2)})</option>
    `).join('');
    select.innerHTML = productOptions;
  });
  calculateCheckoutTotal();
}

function quickAddToCheckout(productId) {
  switchTab('orders');
  addOrderItemRow(productId);
  showToast('Item added to checkout studio!', 'success');
}

function calculateCheckoutTotal() {
  let subtotal = 0;
  const rows = document.querySelectorAll('.order-item-row');
  rows.forEach(row => {
    const prodId = row.querySelector('.select-order-product')?.value;
    const qty = parseInt(row.querySelector('.input-order-qty')?.value, 10) || 0;
    const product = appState.products.find(p => p.id == prodId);
    if (product && qty > 0) {
      subtotal += product.price * qty;
    }
  });

  document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${subtotal.toFixed(2)}`;
}

async function handleCreateOrder(e) {
  e.preventDefault();
  const userId = document.getElementById('orderUserSelect').value;
  if (!userId) {
    showToast('Please select a purchasing user.', 'error');
    return;
  }

  const items = [];
  const rows = document.querySelectorAll('.order-item-row');
  rows.forEach(row => {
    const prodId = row.querySelector('.select-order-product')?.value;
    const qty = parseInt(row.querySelector('.input-order-qty')?.value, 10) || 0;
    if (prodId && qty > 0) {
      items.push({ product_id: String(prodId), quantity: qty });
    }
  });

  if (items.length === 0) {
    showToast('Please add at least one product item.', 'error');
    return;
  }

  const btn = document.getElementById('btnPlaceOrder');
  btn.disabled = true;
  btn.textContent = '⏳ Communicating with User & Product Services...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: String(userId), items })
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.detail || 'Cross-service order creation failed');
    }

    const orderData = await res.json();
    showToast(`Order #${orderData.data?.id} successfully dispatched across services!`, 'success');
    await fetchOrders();

    // Reset items
    document.getElementById('orderItemsBuilder').innerHTML = '';
    addOrderItemRow();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Dispatch Cross-Service Order';
  }
}

// ----------------- CI/CD SIMULATION -----------------
async function runPipelineSimulation() {
  const steps = [
    { id: 'pipe-step-1', name: 'Lint & Code Quality' },
    { id: 'pipe-step-2', name: 'Unit & Integration Tests' },
    { id: 'pipe-step-3', name: 'Trivy Security Scan' },
    { id: 'pipe-step-4', name: 'Docker Image Build & Push' },
    { id: 'pipe-step-5', name: 'K8s Blue-Green Deployment' }
  ];

  // Reset steps
  steps.forEach(s => {
    const el = document.getElementById(s.id);
    el.className = 'pipeline-step';
    el.querySelector('.step-status-icon').textContent = '⋯';
  });

  showToast('Starting CI/CD Pipeline Demo Run...', 'success');

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const el = document.getElementById(step.id);
    el.classList.add('step-running');
    el.querySelector('.step-status-icon').textContent = '⟳';

    await new Promise(r => setTimeout(r, 1200));

    el.classList.remove('step-running');
    el.classList.add('step-complete');
    el.querySelector('.step-status-icon').textContent = '✓';
  }

  showToast('CI/CD Pipeline Completed Successfully! 100% Green.', 'success');
}

// ----------------- UTILS & MODALS -----------------
function updateMetrics() {
  document.getElementById('metricTotalUsers').textContent = appState.users.length;
  document.getElementById('metricTotalProducts').textContent = appState.products.length;
  document.getElementById('metricTotalOrders').textContent = appState.orders.length;
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function copyUsersJson() {
  navigator.clipboard.writeText(JSON.stringify(appState.users, null, 2));
  showToast('Users JSON copied to clipboard!', 'success');
}

function copyProductsJson() {
  navigator.clipboard.writeText(JSON.stringify(appState.products, null, 2));
  showToast('Products JSON copied to clipboard!', 'success');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
