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

// Simulated exchange rates (in real app, these would come from APIs)
const getExchangeRates = (fromCurrency, toCurrency) => {
  const baseRates = {
    'USD-INR': { rate: 83.25, lastUpdated: new Date() },
    'USD-EUR': { rate: 0.92, lastUpdated: new Date() },
    'USD-GBP': { rate: 0.79, lastUpdated: new Date() },
    'USD-CAD': { rate: 1.35, lastUpdated: new Date() },
    'USD-AUD': { rate: 1.52, lastUpdated: new Date() },
    'EUR-INR': { rate: 90.45, lastUpdated: new Date() },
    'GBP-INR': { rate: 105.30, lastUpdated: new Date() },
    'CAD-INR': { rate: 61.67, lastUpdated: new Date() },
    'AUD-INR': { rate: 54.77, lastUpdated: new Date() }
  };

  const key = `${fromCurrency}-${toCurrency}`;
  return baseRates[key] || { rate: 1, lastUpdated: new Date() };
};

// Get provider rates with fees
const getProviderRates = (fromCurrency, toCurrency, amount = 1000) => {
  const marketRate = getExchangeRates(fromCurrency, toCurrency);
  
  return providers.map(provider => {
    // Simulate different rates and fees for each provider
    const rateVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const providerRate = marketRate.rate * (1 + rateVariation);
    
    // Simulate fees based on amount and provider
    let fee = 0;
    if (provider.id === 'wise') {
      fee = amount * 0.007; // 0.7% fee
    } else if (provider.id === 'xoom') {
      fee = amount * 0.008; // 0.8% fee
    } else if (provider.id === 'remitly') {
      fee = amount * 0.006; // 0.6% fee
    } else if (provider.id === 'western-union') {
      fee = amount * 0.01; // 1% fee
    } else if (provider.id === 'moneygram') {
      fee = amount * 0.009; // 0.9% fee
    }

    // Apply first-time user discounts
    const hasFirstTimeOffer = provider.offers.some(offer => offer.type === 'first-time');
    if (hasFirstTimeOffer) {
      fee = Math.max(0, fee - 5); // $5 discount for first-time users
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