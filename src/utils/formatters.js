import { currencyData } from '../features/valuation/data/currencyData';

/**
 * Returns a readable label for a currency code (e.g., '060' -> 'EUR' or 'EURO')
 */
export const getCurrencyLabel = (code) => {
  if (!code) return 'USD';
  
  // Custom mappings for common SIM codes to abbreviations
  const overrides = {
    '060': 'EUR',
    'DOL': 'USD',
    'PES': 'ARS',
    '012': 'BRL',
    '021': 'GBP',
    '011': 'UYU',
    '009': 'CHF',
    '061': 'CNY'
  };

  if (overrides[code]) return overrides[code];

  const found = currencyData.find(c => c.code === code);
  return found ? found.code : code;
};

/**
 * Robust date parser for valuation records
 */
export const parseRecordDate = (v) => {
  const val = v.updatedAt || v.createdAt || (v.serverUpdatedAt?.toDate ? v.serverUpdatedAt.toDate() : null);
  if (!val) return new Date(0);
  
  // If it's a Firestore Timestamp or similar
  if (val.seconds) return new Date(val.seconds * 1000);
  
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  
  // Try cleaning common formats if needed
  return new Date(0);
};
