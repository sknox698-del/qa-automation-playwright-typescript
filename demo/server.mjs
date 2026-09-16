import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const products = [
  { id: 'bag', name: 'Everyday Backpack', priceCents: 4900, stock: 5, icon: '🎒' },
  { id: 'bottle', name: 'Trail Bottle', priceCents: 1800, stock: 9, icon: '🧴' },
  { id: 'notebook', name: 'Pocket Notebook', priceCents: 750, stock: 20, icon: '📓' },
  { id: 'headphones', name: 'Studio Headphones', priceCents: 8900, stock: 0, icon: '🎧' },
];
const sessions = new Map();
const files = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
const fail = (status, message) => Object.assign(new Error(message), { status });

async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 16_384) throw fail(413, 'Request too large');
  }
  try { return JSON.parse(raw); } catch { throw fail(400, 'Invalid JSON'); }
}

function shippingValid(shipping) {
  return shipping && typeof shipping.name === 'string' && shipping.name.trim().length >= 2
    && shipping.name.trim().length <= 60 && typeof shipping.email === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)
    && typeof shipping.postcode === 'string' && /^\d{5}$/.test(shipping.postcode);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };
  try {
    if (req.method === 'GET' && files[url.pathname]) {
      const [file, type] = files[url.pathname];
      res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
      return res.end(await readFile(new URL('./public/' + file, import.meta.url)));
    }
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && url.pathname === '/api/health') return send(200, { status: 'ok', app: 'northstar-demo' });
    if (req.method === 'GET' && url.pathname === '/api/products') return send(200, { products });
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const credentials = await body(req);
      if (credentials?.email !== 'steve@example.test' || credentials?.password !== 'DemoPass123!') throw fail(401, 'Invalid email or password');
      const token = randomUUID();
      sessions.set(token, { orders: [], created: Date.now() });
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Strict; Path=/`);
      return send(200, { user: { name: 'Steve' } });
    }
    const token = req.headers.cookie?.split('; ').find(c => c.startsWith('session='))?.slice(8);
    const session = sessions.get(token);
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      sessions.delete(token);
      res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
      return send(200, { message: 'Signed out' });
    }
    if (url.pathname === '/api/me' && req.method === 'GET') {
      if (!session) throw fail(401, 'Please sign in');
      return send(200, { user: { name: 'Steve' } });
    }
    if (url.pathname === '/api/orders') {
      if (!session) throw fail(401, 'Please sign in');
      if (req.method === 'GET') return send(200, { orders: session.orders });
      if (req.method === 'POST') {
        const order = await body(req);
        if (!shippingValid(order?.shipping)) throw fail(400, 'Invalid shipping details');
        if (!Array.isArray(order.items) || order.items.length === 0) throw fail(400, 'Cart is empty');
        const ids = new Set();
        let subtotalCents = 0;
        for (const item of order.items) {
          const product = products.find(p => p.id === item?.id);
          if (!product || ids.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
            throw fail(400, 'Invalid item or quantity');
          }
          ids.add(item.id);
          subtotalCents += product.priceCents * item.quantity;
        }
        const shippingCents = subtotalCents >= 6000 ? 0 : 495;
        const saved = { id: randomUUID(), items: order.items.map(({ id, quantity }) => ({ id, quantity })), subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
        session.orders.push(saved);
        return send(201, saved);
      }
      throw fail(405, 'Method not allowed');
    }
    throw fail(404, 'Not found');
  } catch (error) { send(error.status || 500, { error: error.status ? error.message : 'Unexpected server error' }); }
});
// Demo sessions expire; tests use independent cookies and never share orders.
setInterval(() => {
  for (const [key, value] of sessions) if (Date.now() - value.created > 3_600_000) sessions.delete(key);
}, 60_000).unref();
server.listen(4187, '127.0.0.1', () => console.log('Northstar demo: http://127.0.0.1:4187'));
