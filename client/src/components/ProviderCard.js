import React from 'react';
import { Star, Clock, DollarSign, Gift, AlertTriangle } from 'lucide-react';

const ProviderCard = ({ provider, fromCurrency, toCurrency, amount }) => {
  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOfferExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-gray-600">
                {provider.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {provider.name}
              </h3>
              <div className="flex items-center">
                <Star className={`h-4 w-4 ${getRatingColor(provider.rating)} mr-1`} />
                <span className="text-sm text-gray-600">
                  {provider.rating} ({provider.rating >= 4.5 ? 'Excellent' : provider.rating >= 4.0 ? 'Good' : 'Fair'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {provider.rate.toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">
            {fromCurrency} to {toCurrency} rate
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        {/* Transfer Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">You send:</span>
            <span className="font-medium">{formatCurrency(amount, fromCurrency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fee:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(provider.fee, fromCurrency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">You receive:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(provider.amountReceived, toCurrency)}
            </span>
          </div>
        </div>

        {/* Transfer Speed */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700">
            Transfer speed: <span className="font-medium">{provider.transferSpeed}</span>
          </span>
        </div>

        {/* Features */}
        {provider.features && provider.features.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Key Features:</div>
            <div className="flex flex-wrap gap-1">
              {provider.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Offers */}
        {provider.offers && provider.offers.length > 0 && (
          <div className="space-y-2">
            {provider.offers.map((offer, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isOfferExpired(offer.validUntil)
                    ? 'bg-gray-50 border-gray-200'
                    : offer.type === 'first-time'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <Gift className={`h-4 w-4 mr-2 mt-0.5 ${
                    isOfferExpired(offer.validUntil)
                      ? 'text-gray-400'
                      : offer.type === 'first-time'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      isOfferExpired(offer.validUntil)
                        ? 'text-gray-500'
                        : offer.type === 'first-time'
                        ? 'text-green-800'
                        : 'text-blue-800'
                    }`}>
                      {offer.description}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${
                        isOfferExpired(offer.validUntil)
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}>
                        Valid until: {formatDate(offer.validUntil)}
                      </span>
                      {isOfferExpired(offer.validUntil) && (
                        <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Send Money with {provider.name}
        </button>
      </div>
    </div>
  );
};

export default ProviderCard; 