# Remittance Rate Comparison App

A full-stack web application for comparing remittance exchange rates between major providers like Wise, Xoom, Remitly, Western Union, and MoneyGram.

## Features

- **Real-time Exchange Rates**: Compare rates from multiple remittance providers
- **Live Market Rate Display**: Prominent display of current market rates
- **Provider Comparison**: Sort providers by rate, fees, or transfer speed
- **Special Offers**: Display first-time user promos and limited-time offers
- **Auto-refresh**: Automatic rate updates every 5 minutes
- **Responsive Design**: Clean, modern UI that works on all devices
- **Trust Indicators**: Provider ratings and transfer speed information

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Data**: Simulated API responses (easily replaceable with real APIs)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom animations

## Quick Start

### Option 1: Standalone HTML Version (No Setup Required)

Simply open `index.html` in your web browser to use the application immediately!

### Option 2: Full-Stack Version (Requires Node.js)

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

#### Installation

1. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Start the development servers**
   ```bash
   # Start both server and client (recommended)
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### GET `/api/currencies`
Returns available currencies for selection.

### GET `/api/providers`
Returns list of remittance providers with their details.

### GET `/api/rates`
Returns exchange rates for all providers.
- **Query Parameters:**
  - `from`: Source currency code (e.g., "USD")
  - `to`: Target currency code (e.g., "INR")
  - `amount`: Transfer amount (default: 1000)

### GET `/api/market-rate`
Returns the current market rate for a currency pair.
- **Query Parameters:**
  - `from`: Source currency code
  - `to`: Target currency code

### GET `/api/health`
Health check endpoint.

## Project Structure

```
compareremitance/
├── server/
│   └── index.js              # Express server with API routes
├── client/
│   ├── public/
│   │   └── index.html        # Main HTML file
│   ├── src/
│   │   ├── components/
│   │   │   ├── CurrencySelector.js
│   │   │   ├── MarketRateCard.js
│   │   │   ├── ProviderCard.js
│   │   │   └── LoadingSpinner.js
│   │   ├── App.js            # Main React component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles with Tailwind
│   ├── package.json          # Client dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── postcss.config.js     # PostCSS configuration
├── package.json              # Server dependencies and scripts
├── index.html               # Standalone HTML version
└── README.md                # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
```

### Adding Real API Integration

To integrate with real exchange rate APIs:

1. **Update `server/index.js`**:
   ```javascript
   // Replace the getExchangeRates function with real API calls
   const getExchangeRates = async (fromCurrency, toCurrency) => {
     try {
       const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
       return {
         rate: response.data.rates[toCurrency],
         lastUpdated: new Date()
       };
     } catch (error) {
       console.error('Error fetching rates:', error);
       return { rate: 1, lastUpdated: new Date() };
     }
   };
   ```

2. **Add API keys to environment variables**:
   ```env
   EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

## Customization

### Adding New Providers

1. **Update the providers array in `server/index.js`**:
   ```javascript
   const providers = [
     // ... existing providers
     {
       id: 'new-provider',
       name: 'New Provider',
       logo: 'https://newprovider.com/favicon.ico',
       rating: 4.5,
       transferSpeed: '1-2 days',
       minAmount: 1,
       maxAmount: 50000,
       offers: [
         {
           type: 'promo',
           description: 'Special offer description',
           validUntil: '2024-12-31'
         }
       ]
     }
   ];
   ```

2. **Add fee calculation logic**:
   ```javascript
   // In getProviderRates function
   if (provider.id === 'new-provider') {
     fee = amount * 0.008; // 0.8% fee
   }
   ```

### Styling Customization

The app uses Tailwind CSS. Customize colors and styles in:
- `client/tailwind.config.js` - Theme configuration
- `client/src/index.css` - Global styles
- Individual component files - Component-specific styles

## Deployment

### Production Build

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Serve the built files**:
   ```bash
   # Add static file serving to server/index.js
   app.use(express.static(path.join(__dirname, '../client/build')));
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN cd client && npm install && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub. 