// ============================================================
//  MongoDB Init Script — runs once on first container boot
//  Path inside container: /docker-entrypoint-initdb.d/init.js
// ============================================================

db = db.getSiblingDB('shopdash');

// Create an app-level user with least privilege
db.createUser({
  user: 'shopdash_app',
  pwd:  'shopdash_app_pass',       // override via .env in production
  roles: [{ role: 'readWrite', db: 'shopdash' }],
});

// Create collections with schema validation
db.createCollection('users',    { validator: { $jsonSchema: { required: ['email','password'] } } });
db.createCollection('products', { validator: { $jsonSchema: { required: ['name','price'] } } });
db.createCollection('orders',   {});
db.createCollection('carts',    {});
db.createCollection('reviews',  {});

print('✅  ShopDash database initialised');
