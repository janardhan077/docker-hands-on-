// ============================================================
//  ShopDash — Express Backend  (server.js)
//  Run:  npm install && node server.js
//  ENV:  MONGO_URI, JWT_SECRET, PORT
// ============================================================

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { User, Product, Order, Cart, Review } = require('./models');

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT  = process.env.JWT_SECRET || 'shopdash_secret_change_me';

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── DB Connect ───────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopdash')
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err));

// ── Auth Middleware ───────────────────────────────────────────
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'shopdash-backend'
  });
});

// ── Helper ───────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT, { expiresIn: '7d' });

// ════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });

    res.status(201).json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/me
app.get('/api/auth/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// ════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ════════════════════════════════════════════════════════════

// GET /api/products  (search, filter, paginate)
app.get('/api/products', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const filter = { isActive: true };
    if (q)        filter.$text = { $search: q };
    if (category) filter.category = category;
    if (minPrice || maxPrice)
      filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(+limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/products  (admin)
app.post('/api/products', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// PUT /api/products/:id  (admin)
app.put('/api/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE /api/products/:id  (admin - soft delete)
app.delete('/api/products/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Product deactivated' });
});

// ════════════════════════════════════════════════════════════
//  CART ROUTES
// ════════════════════════════════════════════════════════════

// GET /api/cart
app.get('/api/cart', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name images price stock');
  res.json(cart || { items: [], total: 0 });
});

// POST /api/cart  (add item)
app.post('/api/cart', protect, async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < qty) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].qty += qty;
    else cart.items.push({ product: productId, qty, price: product.price });

    await cart.save();
    await cart.populate('items.product', 'name images price stock');
    res.json(cart);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/cart/:productId  (update qty)
app.put('/api/cart/:productId', protect, async (req, res) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (qty <= 0) cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    else item.qty = qty;

    await cart.save();
    res.json(cart);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/cart/:productId
app.delete('/api/cart/:productId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.json({ message: 'Item removed' });
});

// ════════════════════════════════════════════════════════════
//  ORDER ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/orders  (place order)
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { shipping, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const items = cart.items.map(i => ({
      product: i.product._id,
      name:    i.product.name,
      image:   i.product.images[0],
      price:   i.price,
      qty:     i.qty,
    }));
    const subtotal     = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingCost = subtotal > 50 ? 0 : 5.99;
    const tax          = +(subtotal * 0.08).toFixed(2);
    const total        = +(subtotal + shippingCost + tax - cart.discount).toFixed(2);

    const order = await Order.create({
      user: req.user.id, items, shipping,
      payment: { method: paymentMethod },
      subtotal, shippingCost, tax, total,
    });

    // Decrement stock
    await Promise.all(items.map(i =>
      Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.qty, sold: i.qty } })
    ));

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/orders/mine  (user's orders)
app.get('/api/orders/mine', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.json(orders);
});

// GET /api/orders/:id
app.get('/api/orders/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorised' });
  res.json(order);
});

// PATCH /api/orders/:id/status  (admin)
app.patch('/api/orders/:id/status', protect, adminOnly, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, ...(req.body.status === 'delivered' && { deliveredAt: Date.now() }) },
    { new: true }
  );
  res.json(order);
});

// ════════════════════════════════════════════════════════════
//  REVIEWS
// ════════════════════════════════════════════════════════════

// POST /api/products/:id/reviews
app.post('/api/products/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const existing = await Review.findOne({ product: req.params.id, user: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({
      product: req.params.id, user: req.user.id,
      rating, title, body,
    });
    res.status(201).json(review);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name avatar').sort('-createdAt');
  res.json(reviews);
});

// ════════════════════════════════════════════════════════════
//  ANALYTICS ROUTES  (admin)
// ════════════════════════════════════════════════════════════

// GET /api/analytics/summary
app.get('/api/analytics/summary', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalRevenue, totalOrders, totalUsers, totalProducts,
      pendingOrders, recentOrders
    ] = await Promise.all([
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, sum: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'pending' }),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
    ]);

    res.json({
      totalRevenue:  totalRevenue[0]?.sum || 0,
      totalOrders,   totalUsers,
      totalProducts, pendingOrders,
      recentOrders,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/analytics/revenue  (last 30 days, daily)
app.get('/api/analytics/revenue', protect, adminOnly, async (req, res) => {
  try {
    const days = 30;
    const since = new Date(Date.now() - days * 86400000);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, 'payment.status': 'paid' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/analytics/top-products
app.get('/api/analytics/top-products', protect, adminOnly, async (req, res) => {
  const products = await Product.find().sort('-sold').limit(5).select('name sold price images');
  res.json(products);
});

// GET /api/analytics/orders-by-status
app.get('/api/analytics/orders-by-status', protect, adminOnly, async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  res.json(data);
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀  ShopDash API running on port ${PORT}`));
module.exports = app;
