/**
 * VJS Billing — MongoDB Seed Script
 * Run: node seed.js
 * Seeds initial products, staff, and settings into the local MongoDB database.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Setting = require('./models/Setting');

const STORES = [
  { id: 'store-1', name: 'Main Store' },
  { id: 'store-2', name: 'Branch 2' },
];

const initialStaff = [
  { name: 'System Admin', role: 'Admin', pin: '0000', storeId: 'store-1' },
];

const initialProducts = [
  { barcode: '8901234567890', name: 'Gold Ring 22K',      category: 'Rings',     weight: 5.5,  purity: '22K',      makingCharge: 2500,  stoneCharge: 0,     goldRate: 7500, stock: 10, storeId: 'store-1' },
  { barcode: '8901234567891', name: 'Gold Necklace 22K',  category: 'Necklaces', weight: 18.2, purity: '22K',      makingCharge: 8500,  stoneCharge: 2000,  goldRate: 7500, stock: 5,  storeId: 'store-1' },
  { barcode: '8901234567892', name: 'Diamond Earrings',   category: 'Earrings',  weight: 2.1,  purity: '18K',      makingCharge: 3200,  stoneCharge: 15000, goldRate: 7200, stock: 8,  storeId: 'store-1' },
  { barcode: '8901234567893', name: 'Gold Bracelet 22K',  category: 'Bracelets', weight: 12.5, purity: '22K',      makingCharge: 5500,  stoneCharge: 0,     goldRate: 7500, stock: 6,  storeId: 'store-2' },
  { barcode: '8901234567894', name: 'Gold Bangle Set 22K',category: 'Bangles',   weight: 35.0, purity: '22K',      makingCharge: 12000, stoneCharge: 0,     goldRate: 7500, stock: 4,  storeId: 'store-2' },
  { barcode: '8901234567895', name: 'Platinum Ring',      category: 'Rings',     weight: 4.2,  purity: 'Platinum', makingCharge: 4000,  stoneCharge: 8000,  goldRate: 9500, stock: 3,  storeId: 'store-1' },
  { barcode: '8901234567896', name: 'Gold Chain 22K',     category: 'Chains',    weight: 8.8,  purity: '22K',      makingCharge: 3500,  stoneCharge: 0,     goldRate: 7500, stock: 12, storeId: 'store-1' },
  { barcode: '8901234567897', name: 'Ruby Pendant 18K',   category: 'Pendants',  weight: 3.3,  purity: '18K',      makingCharge: 2800,  stoneCharge: 5500,  goldRate: 7200, stock: 7,  storeId: 'store-2' },
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vjs_billing';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Seed Staff ──────────────────────────────────────────
    // Clear existing users to fix any double-hashing from previous runs
    await User.deleteMany({});
    console.log('🌱 Seeding staff (fresh)...');
    for (const s of initialStaff) {
      // Pass raw PIN — the User model pre('save') hook will hash it exactly once
      const user = new User(s);
      await user.save();
    }
    console.log(`   ✓ ${initialStaff.length} staff members added`);

    // ── Seed Products ───────────────────────────────────────
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      console.log('🌱 Seeding products...');
      await Product.insertMany(initialProducts);
      console.log(`   ✓ ${initialProducts.length} products added`);
    } else {
      console.log(`   ⚠ Products already seeded (${existingProducts} found), skipping.`);
    }

    // ── Seed Settings ───────────────────────────────────────
    console.log('🌱 Seeding store settings...');
    for (const store of STORES) {
      await Setting.findOneAndUpdate(
        { storeId: store.id },
        { $setOnInsert: { storeId: store.id, goldRate: 7500 } },
        { upsert: true }
      );
    }
    console.log(`   ✓ Settings for ${STORES.length} stores initialized`);

    console.log('\n🎉 Seeding complete! You can now start the server with: npm start');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
