# ERC-20 Token Tracker

A modern, real-time ERC-20 token tracking application built with React that connects to live Ethereum blockchain data. Track wallet token balances, get detailed token information, and monitor transaction history with an intuitive web interface.

![ERC-20 Token Tracker](https://img.shields.io/badge/ERC--20-Token%20Tracker-blue?style=for-the-badge&logo=ethereum)

## 🌟 Features

### 🔍 **Wallet Tracker**
- **Real-time token balance tracking** for any Ethereum address
- **Live transaction history** with detailed information
- **Portfolio overview** showing all ERC-20 tokens
- **Transaction filtering** (send/receive indicators)
- **Direct Etherscan integration** for detailed blockchain exploration

### 📊 **Token Information**
- **Comprehensive token details** (name, symbol, decimals, total supply)
- **Smart contract verification** and validation
- **Holder statistics** and network information
- **Contract address verification** with direct Etherscan links

### 🔧 **API Configuration**
- **Multiple API provider support** (Etherscan, Alchemy)
- **Easy API key management** with secure local storage
- **Rate limit awareness** and optimization
- **Free tier support** with optional upgrades

### 🎨 **Modern UI/UX**
- **Responsive design** for all devices
- **Real-time loading states** with progress indicators
- **Copy-to-clipboard** functionality for addresses and hashes
- **Error handling** with clear user feedback
- **Dark/light theme** ready architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with ES6 support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/neonite2217/BlockChain/erc20-token-tracker.git
cd erc20-token-tracker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm start
# or
yarn start
```

4. **Open your browser**
Navigate to `http://localhost:3000` to use the application.

## 🔑 API Setup

The tracker works out-of-the-box with free public APIs, but for enhanced functionality and higher rate limits, configure your API keys:

### Etherscan API (Recommended)
1. Visit [Etherscan.io API](https://etherscan.io/apis)
2. Create a free account and generate an API key
3. In the app, click "API Settings" and enter your key
4. **Benefits**: 100,000 requests/day, 5 requests/second

### Alchemy API (Optional)
1. Visit [Alchemy.com](https://alchemy.com)
2. Create account and get your API key
3. Add to settings for enhanced blockchain queries
4. **Benefits**: Advanced querying and WebSocket support

### Rate Limits
| Provider | Free Tier | With API Key |
|----------|-----------|--------------|
| Etherscan | 5 req/sec | 5 req/sec, 100k/day |
| Alchemy | N/A | 300M compute units/month |

## 📖 Usage Guide

### Tracking a Wallet
1. **Enter Ethereum Address**: Paste any valid Ethereum wallet address
2. **Click "Track Wallet"**: The app fetches real-time data
3. **View Results**: See token balances and recent transactions
4. **Explore Transactions**: Click transaction hashes to view on Etherscan

### Getting Token Information
1. **Switch to "Token Info" tab**
2. **Enter Contract Address**: Paste the ERC-20 token contract address
3. **Click "Get Token Info"**: Retrieve comprehensive token details
4. **Analyze Data**: View total supply, holders, and contract information

### Example Addresses to Try
```
Wallets:
- Vitalik Buterin: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
- Ethereum Foundation: 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe

Token Contracts:
- DAI Stablecoin: 0x6B175474E89094C44Da98b954EedeAC495271d0F
- USD Coin (USDC): 0xA0b86a33E6ba3e43ef3bb2dfB9b59cDb4558B3ba
- Chainlink (LINK): 0x514910771AF9Ca656af840dff83E8264EcF986CA
- Uniswap (UNI): 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful, consistent icons
- **Local Storage API** - Secure API key management

### API Integration
- **Etherscan API** - Primary blockchain data source
- **RESTful Architecture** - Clean, predictable API calls
- **Error Handling** - Comprehensive error management
- **Rate Limiting** - Built-in respect for API limits

### Core Functions
```javascript
// Fetch wallet token balances
fetchWalletTokens(address)

// Get detailed token information
fetchTokenInfo(contractAddress)

// Retrieve transaction history
fetchRecentTransactions(address)

// Validate Ethereum addresses
isValidEthereumAddress(address)
```

## 🔒 Security & Privacy

- **No server-side storage** - All data processing happens client-side
- **Local API key storage** - Keys stored securely in browser localStorage
- **Input validation** - All addresses validated before API calls
- **HTTPS only** - Secure communication with APIs
- **No tracking** - No user data collection or analytics

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling consistency
- Add error handling for all API calls
- Write clear, self-documenting code
- Test with various Ethereum addresses

## 📊 Performance Optimization

- **Lazy loading** for transaction history
- **Debounced API calls** to prevent spam
- **Caching strategy** for repeated queries
- **Optimistic UI updates** for better UX
- **Error boundaries** for graceful failure handling

## 🐛 Troubleshooting

### Common Issues

**"No tokens found" for valid wallet**
- The wallet may not have recent ERC-20 activity
- Try a more active wallet address
- Check if the address is a contract, not an EOA

**API rate limit errors**
- Add your free Etherscan API key in settings
- Wait a few seconds between rapid requests
- Consider upgrading to paid API tier for high usage

**Invalid address errors**
- Ensure address starts with '0x'
- Check address length (42 characters total)
- Verify address checksum if copying from other sources

### Getting Help
- Check the browser console for detailed error messages
- Ensure your internet connection is stable
- Try with known working addresses first
- Visit [Etherscan.io](https://etherscan.io) to verify addresses independently

## 📋 Roadmap

### Upcoming Features
- [ ] **Price Integration** - Real-time token prices from CoinGecko
- [ ] **Multi-network Support** - BSC, Polygon, Arbitrum
- [ ] **Portfolio Analytics** - Value tracking and performance metrics
- [ ] **Transaction Export** - CSV/JSON export functionality
- [ ] **Watch Lists** - Save and monitor favorite wallets/tokens
- [ ] **Price Alerts** - Notifications for price changes
- [ ] **NFT Support** - ERC-721 and ERC-1155 token tracking
- [ ] **DeFi Integration** - LP tokens and yield farming positions

### Performance Improvements
- [ ] **WebSocket Integration** - Real-time updates
- [ ] **Service Worker** - Offline functionality
- [ ] **Data Caching** - Improved performance and reduced API calls
- [ ] **Batch Queries** - Multiple address tracking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Etherscan.io** - For providing excellent blockchain APIs
- **Ethereum Foundation** - For the amazing ecosystem
- **Tailwind CSS** - For the fantastic utility framework
- **Lucide Icons** - For beautiful, consistent iconography
- **React Team** - For the powerful frontend framework

---

<div align="center">

**Made with ❤️ for the Ethereum community**

[⭐ Star this repo](https://github.com/neonite2217/BlockChain/erc20-token-tracker) | [🍴 Fork it](https://github.com/neonite2217/BlockChain/erc20-token-tracker/fork) 

</div>
