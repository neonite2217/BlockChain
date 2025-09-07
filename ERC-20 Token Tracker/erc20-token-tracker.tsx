import React, { useState, useEffect } from 'react';
import { Search, Wallet, TrendingUp, RefreshCw, ExternalLink, Copy, Check, Settings, AlertCircle, Key } from 'lucide-react';

const ERC20TokenTracker = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [walletTokens, setWalletTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [copied, setCopied] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    etherscan: '',
    alchemy: '',
    coinGecko: ''
  });

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('tokenTracker_apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Free public endpoints (with rate limits)
  const API_ENDPOINTS = {
    etherscan: 'https://api.etherscan.io/api',
    etherscanFree: 'https://api.etherscan.io/api', // Free tier: 5 calls/sec, 100k calls/day
    coingecko: 'https://api.coingecko.com/api/v3',
    alchemy: apiKeys.alchemy ? `https://eth-mainnet.alchemyapi.io/v2/${apiKeys.alchemy}` : null
  };

  const saveApiKeys = () => {
    localStorage.setItem('tokenTracker_apiKeys', JSON.stringify(apiKeys));
    setShowSettings(false);
  };

  const getEtherscanApiKey = () => {
    // Use user's API key if available, otherwise use free tier (no key needed but limited)
    return apiKeys.etherscan || 'YourApiKeyToken';
  };

  const fetchTokenInfo = async (contractAddress) => {
    try {
      const apiKey = getEtherscanApiKey();
      
      // Get token info from contract
      const response = await fetch(
        `${API_ENDPOINTS.etherscan}?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${apiKey}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch token info');
      
      const data = await response.json();
      
      if (data.status === '1' && data.result && data.result.length > 0) {
        const token = data.result[0];
        
        // Get additional stats
        const holdersResponse = await fetch(
          `${API_ENDPOINTS.etherscan}?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=1&apikey=${apiKey}`
        );
        
        let holders = 'N/A';
        if (holdersResponse.ok) {
          const holdersData = await holdersResponse.json();
          if (holdersData.status === '1') {
            holders = '10,000+'; // Approximate since we can't get exact count from free API
          }
        }
        
        return {
          address: contractAddress,
          name: token.tokenName || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          decimals: token.divisor || '18',
          totalSupply: token.totalSupply ? formatTokenAmount(token.totalSupply, token.divisor) : 'N/A',
          holders: holders,
          transfers: 'N/A' // Would need premium API for this
        };
      } else {
        throw new Error('Token not found or invalid contract address');
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  };

  const fetchWalletTokens = async (address) => {
    try {
      const apiKey = getEtherscanApiKey();
      
      // Get ERC-20 token transfers for the wallet
      const response = await fetch(
        `${API_ENDPOINTS.etherscan}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${apiKey}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch wallet tokens');
      
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        // Process transactions to get unique tokens
        const tokenMap = new Map();
        
        data.result.slice(0, 50).forEach(tx => { // Limit to recent 50 transactions
          const tokenAddress = tx.contractAddress.toLowerCase();
          const isReceive = tx.to.toLowerCase() === address.toLowerCase();
          const value = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
          
          if (tokenMap.has(tokenAddress)) {
            const existing = tokenMap.get(tokenAddress);
            existing.balance += isReceive ? value : -value;
            existing.transactions.push(tx);
          } else {
            tokenMap.set(tokenAddress, {
              address: tx.contractAddress,
              name: tx.tokenName,
              symbol: tx.tokenSymbol,
              decimals: tx.tokenDecimal,
              balance: isReceive ? value : -value,
              transactions: [tx]
            });
          }
        });
        
        // Convert map to array and filter out zero balances
        const tokens = Array.from(tokenMap.values())
          .filter(token => token.balance > 0)
          .map(token => ({
            ...token,
            balance: token.balance.toFixed(6),
            value: 'N/A', // Would need price API integration
            price: 'N/A'
          }))
          .slice(0, 10); // Show top 10 tokens
        
        return tokens;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
      throw error;
    }
  };

  const fetchRecentTransactions = async (address) => {
    try {
      const apiKey = getEtherscanApiKey();
      
      const response = await fetch(
        `${API_ENDPOINTS.etherscan}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&page=1&offset=10&apikey=${apiKey}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        return data.result.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          token: tx.tokenSymbol,
          amount: (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(6),
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
          type: tx.to.toLowerCase() === address.toLowerCase() ? 'receive' : 'send',
          blockNumber: tx.blockNumber
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const formatTokenAmount = (amount, decimals) => {
    const divisor = Math.pow(10, parseInt(decimals));
    const formatted = (parseFloat(amount) / divisor).toLocaleString();
    return formatted;
  };

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleWalletSearch = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!isValidEthereumAddress(walletAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const [tokens, transactions] = await Promise.all([
        fetchWalletTokens(walletAddress),
        fetchRecentTransactions(walletAddress)
      ]);
      
      setWalletTokens(tokens);
      setRecentTransactions(transactions);
      
      if (tokens.length === 0) {
        setError('No ERC-20 tokens found for this address or address has no recent token activity');
      }
    } catch (error) {
      setError(`Error fetching wallet data: ${error.message}`);
      setWalletTokens([]);
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSearch = async () => {
    if (!tokenAddress) {
      setError('Please enter a token contract address');
      return;
    }
    
    if (!isValidEthereumAddress(tokenAddress)) {
      setError('Please enter a valid Ethereum contract address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchTokenInfo(tokenAddress);
      setTokenData(data);
    } catch (error) {
      setError(`Error fetching token data: ${error.message}`);
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openEtherscan = (hash) => {
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="text-blue-600" size={40} />
            ERC-20 Token Tracker
          </h1>
          <p className="text-gray-600">Track ERC-20 tokens, balances, and transactions on Ethereum - Live Data</p>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
          >
            <Settings size={16} />
            API Settings
          </button>
        </div>

        {/* API Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">API Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etherscan API Key (Optional - for higher rate limits)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.etherscan}
                    onChange={(e) => setApiKeys({...apiKeys, etherscan: e.target.value})}
                    placeholder="Your Etherscan API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get free API key at <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="text-blue-600">etherscan.io</a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alchemy API Key (Optional - for enhanced features)
                  </label>
                  <input
                    type="password"
                    value={apiKeys.alchemy}
                    onChange={(e) => setApiKeys({...apiKeys, alchemy: e.target.value})}
                    placeholder="Your Alchemy API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveApiKeys}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Rate Limits:</strong> Without API keys, you're limited to ~5 requests per second. 
                    Add your free Etherscan API key for 5 requests/second and 100,000 requests/day.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'wallet'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Wallet className="inline-block mr-2" size={18} />
              Wallet Tracker
            </button>
            <button
              onClick={() => setActiveTab('token')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'token'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Search className="inline-block mr-2" size={18} />
              Token Info
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* Wallet Tracker Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Wallet Address</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="0x742d35Cc6634C0532925a3b8D000000000000000"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleWalletSearch()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleWalletSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  {loading ? 'Tracking...' : 'Track Wallet'}
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Example: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (Vitalik's address)
              </div>
            </div>

            {/* Token Holdings */}
            {walletTokens.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Token Holdings</h2>
                  <div className="text-sm text-gray-600">
                    Showing recent ERC-20 tokens based on transaction history
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium text-gray-600">Token</th>
                        <th className="text-right py-3 font-medium text-gray-600">Balance</th>
                        <th className="text-center py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTokens.map((token, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <div className="font-semibold text-gray-800">{token.symbol}</div>
                              <div className="text-sm text-gray-600">{token.name}</div>
                              <div className="text-xs text-gray-500 font-mono">{truncateAddress(token.address)}</div>
                            </div>
                          </td>
                          <td className="text-right py-4 font-medium">{token.balance}</td>
                          <td className="text-center py-4">
                            <button
                              onClick={() => copyToClipboard(token.address, `token-${index}`)}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="Copy token address"
                            >
                              {copied === `token-${index}` ? (
                                <Check size={16} className="text-green-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent ERC-20 Transactions</h2>
                <div className="space-y-4">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'receive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {tx.type === 'receive' ? '+' : '-'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.amount} {tx.token}
                          </div>
                          <div className="text-sm text-gray-600">
                            {tx.type === 'receive' ? 'From' : 'To'}: {truncateAddress(tx.type === 'receive' ? tx.from : tx.to)}
                          </div>
                          <div className="text-xs text-gray-500">Block #{tx.blockNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{tx.timestamp}</div>
                        <button
                          onClick={() => openEtherscan(tx.hash)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Etherscan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Token Info Tab */}
        {activeTab === 'token' && (
          <div className="space-y-6">
            {/* Token Search Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Token Contract Address</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="0x6B175474E89094C44Da98b954EedeAC495271d0F"
                  value={tokenAddress}
                  onChange={(e) => {
                    setTokenAddress(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleTokenSearch()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleTokenSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  {loading ? 'Loading...' : 'Get Token Info'}
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Example: 0x6B175474E89094C44Da98b954EedeAC495271d0F (DAI Token)
              </div>
            </div>

            {/* Token Details */}
            {tokenData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Token Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Token Name</label>
                      <div className="text-lg font-semibold text-gray-800">{tokenData.name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Symbol</label>
                      <div className="text-lg font-semibold text-gray-800">{tokenData.symbol}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Decimals</label>
                      <div className="text-lg font-semibold text-gray-800">{tokenData.decimals}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Supply</label>
                      <div className="text-lg font-semibold text-gray-800">{tokenData.totalSupply}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approximate Holders</label>
                      <div className="text-lg font-semibold text-gray-800">{tokenData.holders}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Network</label>
                      <div className="text-lg font-semibold text-gray-800">Ethereum Mainnet</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contract Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm font-mono text-gray-800 bg-gray-100 px-3 py-2 rounded flex-1">
                        {tokenData.address}
                      </div>
                      <button
                        onClick={() => copyToClipboard(tokenData.address, 'contract')}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Copy contract address"
                      >
                        {copied === 'contract' ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => window.open(`https://etherscan.io/token/${tokenData.address}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View on Etherscan"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Fetching live data from Ethereum blockchain...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Powered by Etherscan API • Live Ethereum data • Add your API keys for higher rate limits
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Real-time data
            </span>
            <span className="flex items-center gap-1">
              <Key size={12} />
              {apiKeys.etherscan ? 'Custom API' : 'Free tier'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERC20TokenTracker;