# Crypto Spread Navigator

A comprehensive cryptocurrency arbitrage and market analysis platform that helps traders identify and execute profitable trading opportunities across multiple exchanges.

## Features

### Arbitrage Scanner

The Arbitrage Scanner provides real-time monitoring of price differences across crypto exchanges, enabling traders to capitalize on market inefficiencies.

- **Direct Arbitrage**: Monitor price differences for the same asset across different exchanges. Buy low on one exchange and sell high on another to capture the spread.

- **Triangular Arbitrage**: Identify opportunities for profit by trading between three different cryptocurrencies on the same exchange, taking advantage of pricing discrepancies.

- **Futures Arbitrage**: Exploit price differences between spot and futures markets for the same asset, allowing for various spread trading strategies.

- **Real-time Data**: All arbitrage opportunities are based on live market data, ensuring you never miss a profitable trade.

- **Exchange Selection**: Filter opportunities by choosing which exchanges to monitor based on your accounts and preferences.

- **Advanced Filters**: Set minimum spread and volume requirements to focus only on the most profitable opportunities.

- **Network Recommendations**: Get recommendations for the optimal blockchain network to use for transfers, minimizing fees and transaction times.

### Market Analysis

The Market Analysis section provides advanced analytical tools to understand market dynamics and relationships between different crypto assets.

- **Correlation Analysis**: Visualize and analyze the relationships between different cryptocurrencies using scatter plots and correlation metrics.

- **Heatmap View**: See at a glance how different assets correlate with each other through an intuitive color-coded heatmap.

- **Volatility Analysis**: Track which assets have the highest and lowest volatility, helping you adjust your trading strategies accordingly.

- **Top Assets Overview**: Quick access to current prices and performance of top cryptocurrencies.

- **Real-time Updates**: All analysis data refreshes automatically to ensure you're making decisions based on the latest market information.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/taffyke/crypto-spread-navigator.git
```

2. Navigate to the project directory:
```
cd crypto-spread-navigator
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm run dev
```

5. Open your browser and navigate to http://localhost:8080

## Implementation Details

### Real-time Data Integration

The application fetches data from multiple cryptocurrency exchanges using their respective APIs, ensuring you have the most up-to-date information for making trading decisions.

### Advanced Arbitrage Algorithms

- **Direct arbitrage** compares prices across exchanges, accounting for fees, transfer times, and transaction costs.
- **Triangular arbitrage** identifies profitable three-way conversion paths within a single exchange.
- **Futures arbitrage** monitors basis trading opportunities between spot and derivatives markets.

### Core Modules

- **Notification System**: Comprehensive notification management for alerts about trading opportunities, security events, and system messages.
- **Security Manager**: Handles API key encryption, two-factor authentication, and other security features.
- **Market Analysis Manager**: Tracks arbitrage opportunities and analyzes market trends.
- **Risk Manager**: Provides risk profiles and portfolio risk assessment.
- **Trading Bot Manager**: Enables automated trading with configurable strategies.
- **Exchange API**: Unified interface for interacting with multiple cryptocurrency exchanges.

### Performance Optimization

- Efficient data polling and WebSocket connections minimize latency
- Caching layer prevents redundant API calls
- Parallel processing of market data for faster opportunity identification

## Inspired By

- ArbitrageScanner
- Coinrule
- Cryptohopper
- Bitsgap
- 3Commas
- TradeSanta
- Crypto.com
- Pionex

## License

This project is licensed under the MIT License - see the LICENSE file for details.
