const axios = require('axios');
const BullionRate = require('../models/BullionRate');

const API_URL = 'https://api.dharun.dev/v1/bullion';

/**
 * Normalizes rates array into convenient key-based map
 */
function normalizeRates(ratesArray = []) {
  const normalized = {};
  if (!Array.isArray(ratesArray)) return normalized;

  for (const item of ratesArray) {
    if (item.metal === 'gold') {
      if (item.karat === '24K' || item.purity === '999') normalized.gold24k = item;
      else if (item.karat === '22K' || item.purity === '916') normalized.gold22k = item;
      else if (item.karat === '18K' || item.purity === '750') normalized.gold18k = item;
      else if (item.karat === '14K' || item.purity === '585') normalized.gold14k = item;
      else if (item.karat) normalized[`gold_${item.karat.toLowerCase()}`] = item;
    } else if (item.metal === 'silver') {
      normalized.silver999 = item;
    } else if (item.metal === 'platinum') {
      normalized.platinum999 = item;
    }
  }

  return normalized;
}

/**
 * Fetches latest bullion rates from India Bullion API and saves to MongoDB
 */
async function updateBullionRates() {
  try {
    const response = await axios.get(API_URL, {
      timeout: 15000,
      headers: {
        'User-Agent': 'VJS-Billing-System/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid bullion API response format');
    }

    const payload = response.data.data;
    const meta = response.data.meta || {};
    const date = payload.date || new Date().toISOString().split('T')[0];
    const rawRates = payload.rates || payload;

    const savedRate = await BullionRate.create({
      rates: rawRates,
      meta,
      date,
      fetchedAt: new Date(),
    });

    console.log(`✅ Bullion rates updated successfully (Date: ${date}, Records: ${Array.isArray(rawRates) ? rawRates.length : 1})`);
    return savedRate;
  } catch (error) {
    const errDetails = error.response?.data || error.message;
    console.error('❌ Bullion update failed:', errDetails);
    throw error;
  }
}

/**
 * Returns latest stored bullion record from MongoDB
 */
async function getLatestBullionRates() {
  const latest = await BullionRate.findOne()
    .sort({ fetchedAt: -1 })
    .lean();

  if (!latest) return null;

  return {
    ...latest,
    normalized: normalizeRates(Array.isArray(latest.rates) ? latest.rates : []),
  };
}

module.exports = {
  updateBullionRates,
  getLatestBullionRates,
  normalizeRates,
};
