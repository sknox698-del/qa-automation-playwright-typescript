const app = document.querySelector('#app');
let products = [];
let user = null;
let cart;
try { cart = JSON.parse(sessionStorage.getItem('cart') || '{}'); } catch { cart = {}; }
if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
const money = cents => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
async function api(path, data) {
  const response = await fetch('/api/' + path, data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  document.querySelector('#cart-count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
}
function totals() {
  const subtotal = products.reduce((sum, p) => sum + p.priceCents * (cart[p.id] || 0), 0);
  const shipping = subtotal === 0 || subtotal >= 6000 ? 0 : 495;
  return `<div class="totals"><div>Subtotal <strong data-testid="subtotal">${money(subtotal)}</strong></div><div>Shipping <strong data-testid="shipping">${money(shipping)}</strong></div><div>Total <strong data-testid="total">${money(subtotal + shipping)}</strong></div></div>`;
}
function catalog() {
  app.innerHTML = `<div class="eyebrow">Everyday essentials / Demo collection</div><h1>Good things. Simply made.</h1><p class="intro">Thoughtful essentials for work, weekends, and everywhere between.<br>Free shipping on orders of €60 or more.</p><div class="toolbar"><label>Search products<input id="search" type="search" placeholder="Find your next everyday favourite"></label><label>Sort by<select id="sort"><option value="name">Name</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><div class="grid" id="products"></div><p role="status" id="added"></p>`;
  function showProducts() {
    const search = document.querySelector('#search').value.trim().toLowerCase();
    const sort = document.querySelector('#sort').value;
    const visible = products.filter(p => p.name.toLowerCase().includes(search)).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'low' ? a.priceCents - b.priceCents : b.priceCents - a.priceCents);
    document.querySelector('#products').innerHTML = visible.map(p => `<article aria-label="${p.name}"><div class="product-art" aria-hidden="true">${p.icon}</div><h2>${p.name}</h2><p class="price">${money(p.priceCents)}</p><p class="stock">${p.stock ? p.stock + ' available' : 'Out of stock'}</p><button data-add="${p.id}" ${!p.stock || cart[p.id] >= p.stock ? 'disabled' : ''}>Add to cart</button></article>`).join('') || '<p class="empty">No products found.</p>';
    document.querySelectorAll('[data-add]').forEach(button => button.onclick = () => {
      const id = button.dataset.add;
      cart[id] = (cart[id] || 0) + 1;
      saveCart();
      document.querySelector('#added').textContent = products.find(p => p.id === id).name + ' added to cart.';
      showProducts();
    });
  }
  document.querySelector('#search').oninput = showProducts;
  document.querySelector('#sort').onchange = showProducts;
  showProducts();
}
function login() {
  app.innerHTML = `<section class="panel narrow"><div class="eyebrow">Welcome back</div><h1>Sign in</h1><p class="muted">Demo account: steve@example.test<br>Password: DemoPass123!</p><form novalidate><label>Email<input name="email" type="email" autocomplete="username"></label><label>Password<input name="password" type="password" autocomplete="current-password"></label><button>Sign in</button><p role="alert" class="error"></p></form></section>`;
  app.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    const alert = app.querySelector('[role=alert]');
    if (!values.email.trim() || !values.password) { alert.textContent = 'Email and password are required.'; return; }
    try {
      user = (await api('login', values)).user;
      location.hash = '#catalog';
    } catch (error) { alert.textContent = error.message; }
  };
}
function cartPage() {
  const items = products.filter(p => cart[p.id]);
  app.innerHTML = `<h1>Your cart</h1><section class="panel">${items.length ? items.map(p => `<div class="cart-row" role="group" aria-label="${p.name}"><strong>${p.name}</strong><span>${money(p.priceCents)}</span><label>Quantity for ${p.name}<input type="number" min="1" max="${p.stock}" value="${cart[p.id]}" data-quantity="${p.id}"></label><button data-remove="${p.id}">Remove ${p.name}</button></div>`).join('') + totals() + '<button id="checkout">Checkout</button>' : '<p>Your cart is empty.</p><a href="#catalog">Continue shopping</a>'}<p role="alert" class="error"></p></section>`;
  document.querySelectorAll('[data-quantity]').forEach(input => input.onchange = () => {
    const product = products.find(p => p.id === input.dataset.quantity);
    const quantity = Number(input.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      app.querySelector('[role=alert]').textContent = `Quantity must be between 1 and ${product.stock}.`;
      input.value = cart[product.id];
      return;
    }
    cart[product.id] = quantity; saveCart(); cartPage();
  });
  document.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { delete cart[button.dataset.remove]; saveCart(); cartPage(); });
  const checkout = document.querySelector('#checkout');
  if (checkout) checkout.onclick = () => { location.hash = user ? '#checkout' : '#login'; };
}
function checkout() {
  if (!user) { location.hash = '#login'; return; }
  if (!Object.keys(cart).length) { location.hash = '#cart'; return; }
  app.innerHTML = `<section class="panel narrow"><div class="eyebrow">One last step</div><h1>Checkout</h1><p class="muted">Demo shipping details only. No payment is collected.</p><form novalidate><label>Full name<input name="name" autocomplete="name"></label><label>Email<input name="email" autocomplete="email"></label><label>Postcode<input name="postcode" autocomplete="postal-code"></label>${totals()}<button>Place demo order</button><p role="alert" class="error"></p></form></section>`;
  app.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const shipping = Object.fromEntries(new FormData(event.target));
    const alert = app.querySelector('[role=alert]');
    if (shipping.name.trim().length < 2 || shipping.name.trim().length > 60) { alert.textContent = 'Full name must be 2–60 characters.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) { alert.textContent = 'Enter a valid email address.'; return; }
    if (!/^\d{5}$/.test(shipping.postcode)) { alert.textContent = 'Postcode must contain exactly 5 digits.'; return; }
    const button = event.target.querySelector('button');
    button.disabled = true;
    try {
      const order = await api('orders', { shipping, items: Object.entries(cart).map(([id, quantity]) => ({ id, quantity })) });
      cart = {}; saveCart();
      history.replaceState(null, '', '#confirmation');
      app.innerHTML = `<section class="panel narrow"><div class="eyebrow">All done</div><h1>Order confirmed</h1><p>Your demo order has been placed.</p><p>Order reference <strong data-testid="order-id">${escape(order.id)}</strong></p><p>Total <strong data-testid="total">${money(order.totalCents)}</strong></p><a href="#catalog">Continue shopping</a></section>`;
    } catch (error) { alert.textContent = error.message; button.disabled = false; }
  };
}
function render() {
  document.querySelector('#account').textContent = user ? 'Hi, Steve' : 'Sign in';
  document.querySelector('#logout').hidden = !user;
  const route = location.hash;
  if (route === '#login') login();
  else if (route === '#cart') cartPage();
  else if (route === '#checkout') checkout();
  else catalog();
}
document.querySelector('#logout').onclick = async () => {
  await api('logout', {}); user = null; cart = {}; saveCart(); location.hash = '#login'; render();
};
async function start() {
  try {
    products = (await api('products')).products;
    for (const [id, quantity] of Object.entries(cart)) {
      const product = products.find(p => p.id === id);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) delete cart[id];
    }
    const response = await fetch('/api/me');
    if (response.ok) user = (await response.json()).user;
    saveCart(); render(); window.onhashchange = render;
  } catch {
    app.innerHTML = '<h1>Shop unavailable</h1><p role="alert">We could not load the shop. Please reload to try again.</p>';
  }
}
await start();
