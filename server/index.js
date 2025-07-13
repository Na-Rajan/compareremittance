const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for remittance providers
const providers = [
  {
    id: 'wise',
    name: 'Wise',
    logo: 'https://wise.com/favicon.ico',
    rating: 4.8,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 1000000,
    offers: [
      {
        type: 'first-time',
        description: 'No fees on your first transfer up to $500',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'xoom',
    name: 'Xoom',
    logo: 'https://www.xoom.com/favicon.ico',
    rating: 4.5,
    transferSpeed: 'Same day',
    minAmount: 5,
    maxAmount: 50000,
    offers: [
      {
        type: 'promo',
        description: 'Zero fees on transfers over $1000',
        validUntil: '2024-11-30'
      }
    ]
  },
  {
    id: 'remitly',
    name: 'Remitly',
    logo: 'https://www.remitly.com/favicon.ico',
    rating: 4.6,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 100000,
    offers: [
      {
        type: 'first-time',
        description: 'Free transfer on your first $100',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'western-union',
    name: 'Western Union',
    logo: 'https://www.westernunion.com/favicon.ico',
    rating: 4.2,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 50000,
    offers: []
  },
  {
    id: 'moneygram',
    name: 'MoneyGram',
    logo: 'https://www.moneygram.com/favicon.ico',
    rating: 4.3,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    offers: [
      {
        type: 'promo',
        description: 'Reduced fees for transfers over $500',
        validUntil: '2024-10-31'
      }
    ]
  }
];

// Realistic exchange rates based on current market data (as of 2024)
const getExchangeRates = (fromCurrency, toCurrency) => {
  const baseRates = {
    // USD pairs
    'USD-INR': { rate: 83.15, lastUpdated: new Date() },
    'USD-EUR': { rate: 0.91, lastUpdated: new Date() },
    'USD-GBP': { rate: 0.78, lastUpdated: new Date() },
    'USD-CAD': { rate: 1.36, lastUpdated: new Date() },
    'USD-AUD': { rate: 1.51, lastUpdated: new Date() },
    'USD-MXN': { rate: 16.85, lastUpdated: new Date() },
    'USD-PHP': { rate: 56.25, lastUpdated: new Date() },
    'USD-NGN': { rate: 1580.50, lastUpdated: new Date() },
    'USD-BRL': { rate: 4.95, lastUpdated: new Date() },
    
    // EUR pairs
    'EUR-INR': { rate: 91.35, lastUpdated: new Date() },
    'EUR-USD': { rate: 1.10, lastUpdated: new Date() },
    'EUR-GBP': { rate: 0.86, lastUpdated: new Date() },
    'EUR-CAD': { rate: 1.49, lastUpdated: new Date() },
    'EUR-AUD': { rate: 1.66, lastUpdated: new Date() },
    
    // GBP pairs
    'GBP-INR': { rate: 106.45, lastUpdated: new Date() },
    'GBP-USD': { rate: 1.28, lastUpdated: new Date() },
    'GBP-EUR': { rate: 1.16, lastUpdated: new Date() },
    'GBP-CAD': { rate: 1.74, lastUpdated: new Date() },
    'GBP-AUD': { rate: 1.94, lastUpdated: new Date() },
    
    // CAD pairs
    'CAD-INR': { rate: 61.15, lastUpdated: new Date() },
    'CAD-USD': { rate: 0.74, lastUpdated: new Date() },
    'CAD-EUR': { rate: 0.67, lastUpdated: new Date() },
    'CAD-GBP': { rate: 0.57, lastUpdated: new Date() },
    'CAD-AUD': { rate: 1.11, lastUpdated: new Date() },
    
    // AUD pairs
    'AUD-INR': { rate: 55.05, lastUpdated: new Date() },
    'AUD-USD': { rate: 0.66, lastUpdated: new Date() },
    'AUD-EUR': { rate: 0.60, lastUpdated: new Date() },
    'AUD-GBP': { rate: 0.52, lastUpdated: new Date() },
    'AUD-CAD': { rate: 0.90, lastUpdated: new Date() }
  };

  const key = `${fromCurrency}-${toCurrency}`;
  return baseRates[key] || { rate: 1, lastUpdated: new Date() };
};

// Get provider rates with realistic fees based on actual remittance service data
const getProviderRates = (fromCurrency, toCurrency, amount = 1000) => {
  const marketRate = getExchangeRates(fromCurrency, toCurrency);
  
  return providers.map(provider => {
    // Realistic rate variations based on provider spreads
    let rateVariation = 0;
    let fee = 0;
    
    // Realistic fees and rate spreads based on actual provider data
    if (provider.id === 'wise') {
      // Wise typically has very competitive rates with small spreads
      rateVariation = -0.002; // 0.2% better than market
      fee = Math.max(2.50, amount * 0.005); // $2.50 minimum or 0.5%
    } else if (provider.id === 'xoom') {
      // Xoom has moderate spreads
      rateVariation = 0.005; // 0.5% worse than market
      fee = Math.max(4.99, amount * 0.008); // $4.99 minimum or 0.8%
    } else if (provider.id === 'remitly') {
      // Remitly has competitive rates for larger amounts
      rateVariation = amount > 1000 ? -0.001 : 0.003; // Better rates for larger amounts
      fee = Math.max(3.99, amount * 0.006); // $3.99 minimum or 0.6%
    } else if (provider.id === 'western-union') {
      // Western Union has higher spreads
      rateVariation = 0.015; // 1.5% worse than market
      fee = Math.max(5.99, amount * 0.012); // $5.99 minimum or 1.2%
    } else if (provider.id === 'moneygram') {
      // MoneyGram has moderate to high spreads
      rateVariation = 0.010; // 1% worse than market
      fee = Math.max(4.99, amount * 0.010); // $4.99 minimum or 1%
    }

    const providerRate = marketRate.rate * (1 + rateVariation);
    
    // Apply first-time user discounts
    const hasFirstTimeOffer = provider.offers.some(offer => offer.type === 'first-time');
    if (hasFirstTimeOffer) {
      if (provider.id === 'wise') {
        fee = Math.max(0, fee - 10); // $10 discount for Wise first-time users
      } else if (provider.id === 'remitly') {
        fee = Math.max(0, fee - 5); // $5 discount for Remitly first-time users
      }
    }

    // Apply promo offers
    const hasPromoOffer = provider.offers.some(offer => offer.type === 'promo');
    if (hasPromoOffer) {
      if (provider.id === 'xoom' && amount >= 1000) {
        fee = 0; // Zero fees on transfers over $1000
      } else if (provider.id === 'moneygram' && amount >= 500) {
        fee = fee * 0.5; // 50% discount for transfers over $500
      }
    }

    const finalAmount = (amount - fee) * providerRate;
    
    return {
      ...provider,
      rate: providerRate,
      fee: fee,
      finalAmount: finalAmount,
      amountReceived: finalAmount,
      totalCost: amount,
      effectiveRate: finalAmount / amount
    };
  });
};

// API Routes
app.get('/api/currencies', (req, res) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
  ];
  res.json(currencies);
});

app.get('/api/providers', (req, res) => {
  res.json(providers);
});

app.get('/api/rates', (req, res) => {
  const { from, to, amount = 1000 } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and To currencies are required' });
  }

  const marketRate = getExchangeRates(from, to);
  const providerRates = getProviderRates(from, to, parseFloat(amount));

  res.json({
    marketRate,
    providers: providerRates,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/market-rate', (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and To currencies are required' });
  }

  const marketRate = getExchangeRates(from, to);
  res.json(marketRate);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Update rates every 5 minutes (simulated)
cron.schedule('*/5 * * * *', () => {
  console.log('Updating exchange rates...');
  // In a real application, this would fetch from external APIs
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 