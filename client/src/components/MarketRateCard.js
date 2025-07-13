import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';

const MarketRateCard = ({ marketRate, fromCurrency, toCurrency, amount }) => {
  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">
              Live Market Rate
            </h2>
            <p className="text-blue-100">
              {fromCurrency} to {toCurrency}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {marketRate.rate.toFixed(4)}
          </div>
          <div className="text-blue-100 text-sm">
            {formatCurrency(amount, fromCurrency)} = {formatCurrency(amount * marketRate.rate, toCurrency)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-blue-100">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">
            Last updated: {formatDate(marketRate.lastUpdated)}
          </span>
        </div>
        <div className="text-sm">
          Rates update every 5 minutes
        </div>
      </div>
    </div>
  );
};

export default MarketRateCard; 