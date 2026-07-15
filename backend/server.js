const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bills',    require('./routes/bills'));
app.use('/api/loans',    require('./routes/loans'));
app.use('/api/staff',    require('./routes/staff'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/schemes',  require('./routes/schemes'));
app.use('/api/activity-logs', require('./routes/activityLogs'));

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'VJS Billing Backend is running ✅' }));

// ─── Auto-seed System Admin if no users exist ──────────────────────────────
async function ensureSystemAdmin() {
  try {
    const User = require('./models/User');
    const Setting = require('./models/Setting');

    const adminExists = await User.findOne({ name: 'System Admin' });
    if (!adminExists) {
      const admin = new User({
        name:     'System Admin',
        role:     'Admin',
        pin:      '0000',          // hashed automatically by the model
        storeId:  'store-1',
        isActive: true,
      });
      await admin.save();
      console.log('✅ System Admin created');
    } else {
      console.log('✅ System Admin verified');
    }

    // Ensure default store settings exist
    const stores = [
      { id: 'store-1', name: 'Main Store' },
      { id: 'store-2', name: 'Branch 2' },
    ];
    for (const store of stores) {
      await Setting.findOneAndUpdate(
        { storeId: store.id },
        { $setOnInsert: { storeId: store.id, goldRate: 7500, silverRate: 85 } },
        { upsert: true }
      );
    }
    console.log('✅ Store settings ready');
  } catch (err) {
    console.error('⚠️  Auto-seed error:', err.message);
  }
}

// ─── MongoDB Connection ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vjs_billing';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
     console.log('✅ Connected to MongoDB (vjs_billing)');
     await ensureSystemAdmin();          // ← runs every startup, safe to repeat
     app.listen(PORT, () => {
       console.log(`🚀 Backend server running at http://localhost:${PORT}`);
     });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
