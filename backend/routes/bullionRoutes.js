const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { getLatestBullionRates, updateBullionRates } = require('../services/bullionService');
const { logActivity } = require('../utils/logger');

// GET /api/bullion/latest — retrieve latest stored rates
router.get('/latest', async (req, res) => {
  try {
    let result = await getLatestBullionRates();

    // If no rates stored yet, fetch on-demand
    if (!result) {
      try {
        await updateBullionRates();
        result = await getLatestBullionRates();
      } catch (e) {
        console.warn('On-demand bullion fetch failed:', e.message);
      }
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No bullion rates currently available.',
      });
    }

    res.json({
      success: true,
      data: result.rates,
      normalized: result.normalized,
      date: result.date,
      updatedAt: result.fetchedAt,
      sourceMeta: result.meta,
    });
  } catch (error) {
    console.error('Error fetching bullion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve bullion rates.',
      error: error.message,
    });
  }
});

// POST /api/bullion/refresh — manual on-demand refresh
router.post('/refresh', async (req, res) => {
  try {
    const saved = await updateBullionRates();
    const result = await getLatestBullionRates();

    res.json({
      success: true,
      message: 'Bullion rates refreshed successfully from India Bullion API.',
      data: result.rates,
      normalized: result.normalized,
      date: result.date,
      updatedAt: result.fetchedAt,
      sourceMeta: result.meta,
    });
  } catch (error) {
    console.error('Manual bullion refresh failed:', error);
    res.status(502).json({
      success: false,
      message: 'Failed to refresh rates from external bullion service.',
      error: error.message,
    });
  }
});

// POST /api/bullion/apply-to-store — apply latest 22K gold & 999 silver to store settings
router.post('/apply-to-store', async (req, res) => {
  try {
    const storeId = req.body.storeId || 'store-1';
    const result = await getLatestBullionRates();

    if (!result || !result.normalized) {
      return res.status(404).json({ success: false, message: 'No bullion rates available to apply.' });
    }

    const gold22kPerGram = result.normalized.gold22k?.perGram ? Math.round(result.normalized.gold22k.perGram) : null;
    const silverPerGram = result.normalized.silver999?.perGram ? Math.round(result.normalized.silver999.perGram) : null;

    if (!gold22kPerGram && !silverPerGram) {
      return res.status(400).json({ success: false, message: 'Could not extract 22K gold or silver benchmark rate.' });
    }

    const updateFields = {};
    if (gold22kPerGram) updateFields.goldRate = gold22kPerGram;
    if (silverPerGram) updateFields.silverRate = silverPerGram;

    const updatedSetting = await Setting.findOneAndUpdate(
      { storeId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    await logActivity(
      req,
      'Apply Bullion Rates',
      `Applied live IBJA benchmark rates to ${storeId}: Gold 22K ₹${gold22kPerGram}/g, Silver ₹${silverPerGram}/g`
    );

    res.json({
      success: true,
      message: 'Live benchmark rates applied to store successfully.',
      setting: updatedSetting,
      applied: {
        goldRate: gold22kPerGram,
        silverRate: silverPerGram,
      },
    });
  } catch (error) {
    console.error('Error applying bullion rate to store:', error);
    res.status(500).json({ success: false, message: 'Failed to apply rates to store.', error: error.message });
  }
});

module.exports = router;
