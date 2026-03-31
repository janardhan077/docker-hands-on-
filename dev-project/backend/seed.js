// ============================================================
//  ShopDash — Seed Script
//  Run: node seed.js
//  Populates users, products; clears existing data first.
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { User, Product } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopdash';

const CATEGORIES = ['Electronics','Clothing','Books','Home & Garden','Sports'];

const PRODUCTS = [
  { name:'Wireless Noise-Cancelling Headphones', category:'Electronics', price:129.99, comparePrice:179.99, stock:45, sold:312, rating:4.7, numReviews:128, featured:true,
    description:'Premium over-ear headphones with 30hr battery and ANC technology.',
    slug:'wireless-noise-cancelling-headphones', images:['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'] },
  { name:'Slim Fit Oxford Shirt', category:'Clothing', price:39.99, comparePrice:59.99, stock:120, sold:544, rating:4.5, numReviews:89,
    description:'Classic Oxford weave slim-fit shirt for everyday wear.',
    slug:'slim-fit-oxford-shirt', images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'] },
  { name:'JavaScript: The Good Parts', category:'Books', price:19.99, stock:200, sold:1022, rating:4.8, numReviews:342,
    description:'Douglas Crockford's authoritative guide to JavaScript best practices.',
    slug:'javascript-the-good-parts', images:['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'] },
  { name:'Ergonomic Standing Desk', category:'Home & Garden', price:349.00, comparePrice:449.00, stock:18, sold:76, rating:4.6, numReviews:45, featured:true,
    description:'Height-adjustable motorised standing desk with memory presets.',
    slug:'ergonomic-standing-desk', images:['https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400'] },
  { name:'Yoga Mat Pro', category:'Sports', price:54.99, stock:88, sold:230, rating:4.4, numReviews:67,
    description:'6mm thick non-slip yoga mat with alignment lines.',
    slug:'yoga-mat-pro', images:['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400'] },
  { name:'Mechanical Keyboard TKL', category:'Electronics', price:89.99, comparePrice:109.99, stock:62, sold:189, rating:4.6, numReviews:93,
    description:'Tenkeyless mechanical keyboard with Cherry MX Red switches and RGB.',
    slug:'mechanical-keyboard-tkl', images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'] },
  { name:'Running Shoes Ultra', category:'Sports', price:119.99, comparePrice:149.99, stock:55, sold:401, rating:4.7, numReviews:156, featured:true,
    description:'Lightweight responsive running shoes with carbon-fiber plate.',
    slug:'running-shoes-ultra', images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'] },
  { name:'Cast Iron Skillet 12"', category:'Home & Garden', price:44.99, stock:140, sold:622, rating:4.9, numReviews:218,
    description:'Pre-seasoned cast iron skillet for stovetop and oven use.',
    slug:'cast-iron-skillet-12', images:['https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400'] },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear
  await Promise.all([User.deleteMany(), Product.deleteMany()]);
  console.log('Cleared existing data');

  // Create admin + demo user
  const [admin, customer] = await Promise.all([
    User.create({ name:'Admin', email:'admin@shopdash.com', password: await bcrypt.hash('admin123', 12), role:'admin' }),
    User.create({ name:'Jane Doe', email:'jane@example.com', password: await bcrypt.hash('password123', 12), role:'customer' }),
  ]);
  console.log(`Created users: ${admin.email}, ${customer.email}`);

  // Create products
  const products = await Product.insertMany(PRODUCTS);
  console.log(`Created ${products.length} products`);

  console.log('\n✅  Seed complete!');
  console.log('   Admin login: admin@shopdash.com / admin123');
  console.log('   User  login: jane@example.com   / password123');
  await mongoose.disconnect();
}

seed().catch(console.error);
