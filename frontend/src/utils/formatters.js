const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export const formatPrice = (price, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  return `${symbol}${Number(price).toLocaleString('en-IN')}`;
};

export const getCurrencySymbol = (currency) => CURRENCY_SYMBOLS[currency] || '₹';
