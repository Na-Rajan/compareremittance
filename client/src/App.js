import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, Star, Clock, DollarSign, AlertCircle } from 'lucide-react';
import CurrencySelector from './components/CurrencySelector';
import MarketRateCard from './components/MarketRateCard';
import ProviderCard from './components/ProviderCard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState(1000);
  const [rates, setRates] = useState(null);
  const [marketRate, setMarketRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('rate'); // rate, fee, speed
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Fetch rates when currencies or amount change
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchRates();
    }
  }, [fromCurrency, toCurrency, amount]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRates();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, fromCurrency, toCurrency, amount]);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get('/api/currencies');
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/rates', {
        params: {
          from: fromCurrency,
          to: toCurrency,
          amount: amount
        }
      });
      setRates(response.data.providers);
      setMarketRate(response.data.marketRate);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRates();
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const sortedProviders = rates ? [...rates].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return b.rate - a.rate;
      case 'fee':
        return a.fee - b.fee;
      case 'speed':
        return a.transferSpeed.localeCompare(b.transferSpeed);
      default:
        return 0;
    }
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Remittance Rate Comparison
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Currency Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Currencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CurrencySelector
              label="From"
              value={fromCurrency}
              onChange={setFromCurrency}
              currencies={currencies}
            />
            <CurrencySelector
              label="To"
              value={toCurrency}
              onChange={setToCurrency}
              currencies={currencies}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Market Rate Card */}
        {marketRate && (
          <MarketRateCard
            marketRate={marketRate}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            amount={amount}
          />
        )}

        {/* Sort Controls */}
        {rates && rates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Provider Comparison
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rate">Best Rate</option>
                  <option value="fee">Lowest Fee</option>
                  <option value="speed">Transfer Speed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Provider Cards */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                amount={amount}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && (!rates || rates.length === 0) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No providers available
            </h3>
            <p className="text-gray-600">
              Try selecting different currencies or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 