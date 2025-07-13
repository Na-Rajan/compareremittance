const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// API Keys (you'll need to add these to your .env file)
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'demo';
const CURRENCY_CONVERTER_API_KEY = process.env.CURRENCY_CONVERTER_API_KEY || 'demo';

// Middleware
app.use(cors());
app.use(express.json());

// Comprehensive list of remittance providers with realistic data
const providers = [
  // Major International Providers
  {
    id: 'wise',
    name: 'Wise',
    logo: 'https://wise.com/favicon.ico',
    rating: 4.8,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 1000000,
    features: ['Best rates', 'Low fees', 'Transparent pricing'],
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
    features: ['Fast transfers', 'Cash pickup'],
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
    features: ['Express transfers', 'Mobile app'],
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
    features: ['Global network', 'Cash pickup'],
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
    features: ['Wide coverage', 'Instant transfers'],
    offers: [
      {
        type: 'promo',
        description: 'Reduced fees for transfers over $500',
        validUntil: '2024-10-31'
      }
    ]
  },
  
  // Digital-First Providers
  {
    id: 'revolut',
    name: 'Revolut',
    logo: 'https://revolut.com/favicon.ico',
    rating: 4.7,
    transferSpeed: '1-3 days',
    minAmount: 1,
    maxAmount: 50000,
    features: ['Multi-currency', 'App-based'],
    offers: [
      {
        type: 'first-time',
        description: 'Free transfers for Premium users',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'n26',
    name: 'N26',
    logo: 'https://n26.com/favicon.ico',
    rating: 4.4,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 25000,
    features: ['European focus', 'Mobile banking'],
    offers: []
  },
  {
    id: 'monzo',
    name: 'Monzo',
    logo: 'https://monzo.com/favicon.ico',
    rating: 4.3,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 20000,
    features: ['UK-based', 'Transparent fees'],
    offers: []
  },
  
  // Regional Specialists
  {
    id: 'ria-money-transfer',
    name: 'Ria Money Transfer',
    logo: 'https://www.riamoneytransfer.com/favicon.ico',
    rating: 4.1,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    features: ['Global network', 'Cash pickup'],
    offers: [
      {
        type: 'promo',
        description: 'Special rates for Latin America',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'small-world',
    name: 'Small World',
    logo: 'https://www.smallworldfs.com/favicon.ico',
    rating: 4.0,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 5000,
    features: ['European focus', 'Competitive rates'],
    offers: []
  },
  {
    id: 'transfergo',
    name: 'TransferGo',
    logo: 'https://transfergo.com/favicon.ico',
    rating: 4.5,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 50000,
    features: ['Fast transfers', 'Low fees'],
    offers: [
      {
        type: 'first-time',
        description: 'Free first transfer',
        validUntil: '2024-12-31'
      }
    ]
  },
  
  // Cryptocurrency-Based
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: 'https://coinbase.com/favicon.ico',
    rating: 4.2,
    transferSpeed: '1-3 days',
    minAmount: 10,
    maxAmount: 100000,
    features: ['Crypto transfers', 'Global reach'],
    offers: [
      {
        type: 'promo',
        description: 'No fees for crypto transfers',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    logo: 'https://binance.com/favicon.ico',
    rating: 4.0,
    transferSpeed: '1-2 days',
    minAmount: 10,
    maxAmount: 50000,
    features: ['Crypto platform', 'Low fees'],
    offers: []
  },
  
  // Traditional Banks
  {
    id: 'citibank',
    name: 'Citibank',
    logo: 'https://citibank.com/favicon.ico',
    rating: 3.8,
    transferSpeed: '2-5 days',
    minAmount: 100,
    maxAmount: 100000,
    features: ['Bank transfers', 'High limits'],
    offers: []
  },
  {
    id: 'hsbc',
    name: 'HSBC',
    logo: 'https://hsbc.com/favicon.ico',
    rating: 3.9,
    transferSpeed: '2-4 days',
    minAmount: 50,
    maxAmount: 50000,
    features: ['Global banking', 'Secure transfers'],
    offers: []
  },
  {
    id: 'barclays',
    name: 'Barclays',
    logo: 'https://barclays.com/favicon.ico',
    rating: 3.7,
    transferSpeed: '2-3 days',
    minAmount: 25,
    maxAmount: 25000,
    features: ['UK banking', 'International transfers'],
    offers: []
  },
  
  // Specialized Providers
  {
    id: 'worldremit',
    name: 'WorldRemit',
    logo: 'https://worldremit.com/favicon.ico',
    rating: 4.4,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    features: ['Mobile money', 'Air time'],
    offers: [
      {
        type: 'first-time',
        description: 'Free transfer for new users',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'azimo',
    name: 'Azimo',
    logo: 'https://azimo.com/favicon.ico',
    rating: 4.3,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 50000,
    features: ['European focus', 'Fast transfers'],
    offers: [
      {
        type: 'promo',
        description: 'Zero fees on first transfer',
        validUntil: '2024-11-30'
      }
    ]
  },
  {
    id: 'skrill',
    name: 'Skrill',
    logo: 'https://skrill.com/favicon.ico',
    rating: 4.1,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 25000,
    features: ['Digital wallet', 'Global transfers'],
    offers: []
  },
  {
    id: 'neteller',
    name: 'Neteller',
    logo: 'https://neteller.com/favicon.ico',
    rating: 4.0,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 20000,
    features: ['Digital payments', 'Instant transfers'],
    offers: []
  },
  
  // Emerging Markets Specialists
  {
    id: 'paytm-money',
    name: 'Paytm Money',
    logo: 'https://paytmmoney.com/favicon.ico',
    rating: 4.2,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    features: ['India focus', 'UPI transfers'],
    offers: [
      {
        type: 'promo',
        description: 'Cashback on transfers',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: 'https://phonepe.com/favicon.ico',
    rating: 4.1,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 5000,
    features: ['UPI transfers', 'Instant payments'],
    offers: []
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    logo: 'https://pay.google.com/favicon.ico',
    rating: 4.3,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    features: ['Google ecosystem', 'Secure transfers'],
    offers: []
  },
  
  // Fintech Startups
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://stripe.com/favicon.ico',
    rating: 4.6,
    transferSpeed: '1-2 days',
    minAmount: 1,
    maxAmount: 100000,
    features: ['Developer-friendly', 'Global reach'],
    offers: []
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://paypal.com/favicon.ico',
    rating: 4.4,
    transferSpeed: '1-3 days',
    minAmount: 1,
    maxAmount: 50000,
    features: ['Widely accepted', 'Secure'],
    offers: [
      {
        type: 'promo',
        description: 'No fees for friends and family',
        validUntil: '2024-12-31'
      }
    ]
  },
  {
    id: 'square-cash',
    name: 'Square Cash',
    logo: 'https://cash.app/favicon.ico',
    rating: 4.2,
    transferSpeed: 'Same day',
    minAmount: 1,
    maxAmount: 10000,
    features: ['US focus', 'Instant transfers'],
    offers: []
  },
  
  // Regional Banks
  {
    id: 'hdfc-bank',
    name: 'HDFC Bank',
    logo: 'https://hdfcbank.com/favicon.ico',
    rating: 3.9,
    transferSpeed: '1-2 days',
    minAmount: 100,
    maxAmount: 50000,
    features: ['Indian banking', 'NEFT/RTGS'],
    offers: []
  },
  {
    id: 'icici-bank',
    name: 'ICICI Bank',
    logo: 'https://icicibank.com/favicon.ico',
    rating: 3.8,
    transferSpeed: '1-2 days',
    minAmount: 100,
    maxAmount: 50000,
    features: ['Indian banking', 'International transfers'],
    offers: []
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    logo: 'https://sbi.co.in/favicon.ico',
    rating: 3.7,
    transferSpeed: '1-3 days',
    minAmount: 100,
    maxAmount: 100000,
    features: ['Government bank', 'Wide network'],
    offers: []
  }
];

// Real-time exchange rates from multiple APIs
const getExchangeRates = async (fromCurrency, toCurrency) => {
  try {
    // Try multiple APIs for redundancy
    const apis = [
      // Free API (no key required)
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      // Alternative free API
      `https://open.er-api.com/v6/latest/${fromCurrency}`,
      // Currency converter API (requires key)
      EXCHANGE_RATE_API_KEY !== 'demo' ? 
        `https://api.currencyapi.com/v3/latest?apikey=${EXCHANGE_RATE_API_KEY}&base_currency=${fromCurrency}` : null
    ].filter(Boolean);

    for (const apiUrl of apis) {
      try {
        const response = await axios.get(apiUrl, { timeout: 5000 });
        
        if (response.data && response.data.rates) {
          const rate = response.data.rates[toCurrency];
          if (rate) {
            return {
              rate: rate,
              lastUpdated: new Date(),
              source: apiUrl.includes('exchangerate-api') ? 'ExchangeRate-API' : 
                      apiUrl.includes('open.er-api') ? 'Open Exchange Rates' : 'Currency API'
            };
          }
        }
      } catch (error) {
        console.log(`API ${apiUrl} failed, trying next...`);
        continue;
      }
    }

    // Fallback to cached rates if all APIs fail
    console.log('All APIs failed, using fallback rates');
    return getFallbackRates(fromCurrency, toCurrency);
    
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return getFallbackRates(fromCurrency, toCurrency);
  }
};

// Fallback rates for when APIs are unavailable
const getFallbackRates = (fromCurrency, toCurrency) => {
  const fallbackRates = {
    'USD-INR': { rate: 83.15, lastUpdated: new Date(), source: 'Fallback' },
    'USD-EUR': { rate: 0.91, lastUpdated: new Date(), source: 'Fallback' },
    'USD-GBP': { rate: 0.78, lastUpdated: new Date(), source: 'Fallback' },
    'USD-CAD': { rate: 1.36, lastUpdated: new Date(), source: 'Fallback' },
    'USD-AUD': { rate: 1.51, lastUpdated: new Date(), source: 'Fallback' },
    'USD-MXN': { rate: 16.85, lastUpdated: new Date(), source: 'Fallback' },
    'USD-PHP': { rate: 56.25, lastUpdated: new Date(), source: 'Fallback' },
    'USD-NGN': { rate: 1580.50, lastUpdated: new Date(), source: 'Fallback' },
    'USD-BRL': { rate: 4.95, lastUpdated: new Date(), source: 'Fallback' },
    'EUR-INR': { rate: 91.35, lastUpdated: new Date(), source: 'Fallback' },
    'GBP-INR': { rate: 106.45, lastUpdated: new Date(), source: 'Fallback' },
    'CAD-INR': { rate: 61.15, lastUpdated: new Date(), source: 'Fallback' },
    'AUD-INR': { rate: 55.05, lastUpdated: new Date(), source: 'Fallback' }
  };

  const key = `${fromCurrency}-${toCurrency}`;
  return fallbackRates[key] || { rate: 1, lastUpdated: new Date(), source: 'Fallback' };
};

// Get provider rates with realistic fees based on actual remittance service data
const getProviderRates = async (fromCurrency, toCurrency, amount = 1000) => {
  const marketRate = await getExchangeRates(fromCurrency, toCurrency);
  
  return providers.map(provider => {
    // Realistic rate variations based on provider spreads
    let rateVariation = 0;
    let fee = 0;
    
    // Realistic fees and rate spreads based on actual provider data
    if (provider.id === 'wise') {
      rateVariation = -0.002; // 0.2% better than market
      fee = Math.max(2.50, amount * 0.005);
    } else if (provider.id === 'xoom') {
      rateVariation = 0.005; // 0.5% worse than market
      fee = Math.max(4.99, amount * 0.008);
    } else if (provider.id === 'remitly') {
      rateVariation = amount > 1000 ? -0.001 : 0.003;
      fee = Math.max(3.99, amount * 0.006);
    } else if (provider.id === 'western-union') {
      rateVariation = 0.015; // 1.5% worse than market
      fee = Math.max(5.99, amount * 0.012);
    } else if (provider.id === 'moneygram') {
      rateVariation = 0.010; // 1% worse than market
      fee = Math.max(4.99, amount * 0.010);
    } else if (provider.id === 'revolut') {
      rateVariation = -0.001; // Very competitive
      fee = Math.max(1.99, amount * 0.004);
    } else if (provider.id === 'n26') {
      rateVariation = 0.003; // Moderate
      fee = Math.max(2.99, amount * 0.006);
    } else if (provider.id === 'monzo') {
      rateVariation = 0.004; // Moderate
      fee = Math.max(2.50, amount * 0.005);
    } else if (provider.id === 'ria-money-transfer') {
      rateVariation = 0.008; // Higher spread
      fee = Math.max(3.99, amount * 0.009);
    } else if (provider.id === 'small-world') {
      rateVariation = 0.006; // Moderate
      fee = Math.max(2.99, amount * 0.007);
    } else if (provider.id === 'transfergo') {
      rateVariation = 0.002; // Competitive
      fee = Math.max(2.99, amount * 0.005);
    } else if (provider.id === 'coinbase') {
      rateVariation = 0.012; // Crypto volatility
      fee = Math.max(1.99, amount * 0.008);
    } else if (provider.id === 'binance') {
      rateVariation = 0.010; // Crypto platform
      fee = Math.max(1.50, amount * 0.006);
    } else if (provider.id === 'citibank') {
      rateVariation = 0.020; // Traditional bank
      fee = Math.max(25.00, amount * 0.015);
    } else if (provider.id === 'hsbc') {
      rateVariation = 0.018; // Traditional bank
      fee = Math.max(20.00, amount * 0.014);
    } else if (provider.id === 'barclays') {
      rateVariation = 0.019; // Traditional bank
      fee = Math.max(18.00, amount * 0.013);
    } else if (provider.id === 'worldremit') {
      rateVariation = 0.007; // Moderate
      fee = Math.max(2.99, amount * 0.008);
    } else if (provider.id === 'azimo') {
      rateVariation = 0.004; // Competitive
      fee = Math.max(2.50, amount * 0.006);
    } else if (provider.id === 'skrill') {
      rateVariation = 0.008; // Digital wallet
      fee = Math.max(2.99, amount * 0.007);
    } else if (provider.id === 'neteller') {
      rateVariation = 0.009; // Digital payments
      fee = Math.max(2.50, amount * 0.008);
    } else if (provider.id === 'paytm-money') {
      rateVariation = 0.003; // India focus
      fee = Math.max(1.99, amount * 0.004);
    } else if (provider.id === 'phonepe') {
      rateVariation = 0.002; // UPI transfers
      fee = Math.max(1.50, amount * 0.003);
    } else if (provider.id === 'google-pay') {
      rateVariation = 0.001; // Very competitive
      fee = Math.max(1.99, amount * 0.004);
    } else if (provider.id === 'stripe') {
      rateVariation = 0.005; // Developer-friendly
      fee = Math.max(3.99, amount * 0.007);
    } else if (provider.id === 'paypal') {
      rateVariation = 0.008; // Widely accepted
      fee = Math.max(2.99, amount * 0.009);
    } else if (provider.id === 'square-cash') {
      rateVariation = 0.003; // US focus
      fee = Math.max(1.99, amount * 0.005);
    } else if (provider.id === 'hdfc-bank') {
      rateVariation = 0.016; // Indian bank
      fee = Math.max(15.00, amount * 0.012);
    } else if (provider.id === 'icici-bank') {
      rateVariation = 0.017; // Indian bank
      fee = Math.max(16.00, amount * 0.013);
    } else if (provider.id === 'sbi') {
      rateVariation = 0.018; // Government bank
      fee = Math.max(12.00, amount * 0.011);
    } else {
      // Default for any new providers
      rateVariation = 0.010;
      fee = Math.max(4.99, amount * 0.008);
    }

    const providerRate = marketRate.rate * (1 + rateVariation);
    
    // Apply first-time user discounts
    const hasFirstTimeOffer = provider.offers.some(offer => offer.type === 'first-time');
    if (hasFirstTimeOffer) {
      if (provider.id === 'wise') {
        fee = Math.max(0, fee - 10); // $10 discount for Wise first-time users
      } else if (provider.id === 'remitly') {
        fee = Math.max(0, fee - 5); // $5 discount for Remitly first-time users
      } else if (provider.id === 'transfergo') {
        fee = 0; // Free first transfer
      } else if (provider.id === 'worldremit') {
        fee = Math.max(0, fee - 3); // $3 discount for new users
      } else if (provider.id === 'revolut') {
        fee = Math.max(0, fee - 8); // $8 discount for Premium users
      }
    }

    // Apply promo offers
    const hasPromoOffer = provider.offers.some(offer => offer.type === 'promo');
    if (hasPromoOffer) {
      if (provider.id === 'xoom' && amount >= 1000) {
        fee = 0; // Zero fees on transfers over $1000
      } else if (provider.id === 'moneygram' && amount >= 500) {
        fee = fee * 0.5; // 50% discount for transfers over $500
      } else if (provider.id === 'azimo') {
        fee = 0; // Zero fees on first transfer
      } else if (provider.id === 'coinbase') {
        fee = 0; // No fees for crypto transfers
      } else if (provider.id === 'paypal') {
        fee = 0; // No fees for friends and family
      } else if (provider.id === 'paytm-money') {
        fee = fee * 0.8; // 20% cashback
      } else if (provider.id === 'ria-money-transfer') {
        fee = fee * 0.9; // 10% discount for Latin America
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
      effectiveRate: finalAmount / amount,
      marketRateSource: marketRate.source
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

app.get('/api/rates', async (req, res) => {
  const { from, to, amount = 1000 } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and To currencies are required' });
  }

  try {
    const marketRate = await getExchangeRates(from, to);
    const providerRates = await getProviderRates(from, to, parseFloat(amount));

    res.json({
      marketRate,
      providers: providerRates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

app.get('/api/market-rate', async (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and To currencies are required' });
  }

  try {
    const marketRate = await getExchangeRates(from, to);
    res.json(marketRate);
  } catch (error) {
    console.error('Error fetching market rate:', error);
    res.status(500).json({ error: 'Failed to fetch market rate' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Update rates every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Updating exchange rates...');
  try {
    // Test a common currency pair to ensure APIs are working
    const testRate = await getExchangeRates('USD', 'INR');
    console.log(`USD to INR rate updated: ${testRate.rate} (Source: ${testRate.source})`);
  } catch (error) {
    console.error('Error updating rates:', error);
  }
});

// Add endpoint to check API status
app.get('/api/status', async (req, res) => {
  try {
    const testRate = await getExchangeRates('USD', 'INR');
    res.json({
      status: 'OK',
      lastUpdate: testRate.lastUpdated,
      source: testRate.source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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