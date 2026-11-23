const cron = require('node-cron');
const BullionRate = require('../models/BullionRate');
const { updateBullionRates } = require('../services/bullionService');

// Schedule automatic update every 2 hours between 9 AM and 7 PM (India Standard Time)
cron.schedule(
  '0 9-19/2 * * *',
  async () => {
    try {
      console.log('⏰ Running scheduled India Bullion rate update...');
      await updateBullionRates();
    } catch (error) {
      console.error('⚠️ Scheduled bullion update failed:', error.message);
    }
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

// Initial check on server boot: If no rates exist or last fetch was > 2 hours ago, update automatically
(async () => {
  try {
    const latest = await BullionRate.findOne().sort({ fetchedAt: -1 });
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const isStale = !latest || Date.now() - new Date(latest.fetchedAt).getTime() > TWO_HOURS_MS;

    if (isStale) {
      console.log('🔄 Initializing fresh Bullion rates on startup...');
      await updateBullionRates();
    } else {
      console.log(`✅ Stored Bullion rates are current (Last fetched: ${latest.fetchedAt})`);
    }
  } catch (err) {
    console.warn('⚠️ Initial bullion rate fetch could not complete:', err.message);
  }
})();
