import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import { Wallet, ShoppingCart, TrendingUp, LogOut, DollarSign, Users, Activity, ArrowLeft } from "lucide-react";

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Creator Token ABI for buying
const CREATOR_TOKEN_ABI = [
  "function buy(uint256 amount) payable returns (bool)",
  "function getCurrentPrice() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  currentPrice: string;
  totalSupply: string;
  marketCap?: string;
  holders?: number;
}

interface UserHolding {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  value: string;
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [userHoldings, setUserHoldings] = useState<UserHolding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"marketplace" | "portfolio">("marketplace");
  const [buyAmount, setBuyAmount] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("buyerLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Get wallet address from localStorage
    const storedWallet = localStorage.getItem("buyerWallet");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }

    // Initialize Web3
    initWeb3();

    // Load available tokens
    loadAvailableTokens();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadUserHoldings();
    }
  }, [walletAddress]);

  // Load holdings from blockchain when tokens are available
  useEffect(() => {
    if (provider && walletAddress && availableTokens.length > 0) {
      loadUserHoldingsFromBlockchain();
    }
  }, [provider, walletAddress, availableTokens]);

  const initWeb3 = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const web3Provider = new BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        
        setProvider(web3Provider);
        setSigner(web3Signer);

        const signerAddress = await web3Signer.getAddress();
        setWalletAddress(signerAddress);
        localStorage.setItem("buyerWallet", signerAddress);
      }
    } catch (err) {
      console.error("Error initializing Web3:", err);
      setError("Failed to connect to wallet");
    }
  };

  const loadAvailableTokens = () => {
    // Load tokens from localStorage (created by creators)
    const creatorTokens = localStorage.getItem("creatorTokens");
    if (creatorTokens) {
      try {
        const tokens = JSON.parse(creatorTokens);
        setAvailableTokens(tokens);
      } catch (err) {
        console.error("Error loading tokens:", err);
      }
    }
  };

  const loadUserHoldings = async () => {
    // Load user's token holdings from localStorage
    const holdingsKey = `holdings_${walletAddress}`;
    const storedHoldings = localStorage.getItem(holdingsKey);
    
    if (storedHoldings) {
      try {
        setUserHoldings(JSON.parse(storedHoldings));
      } catch (err) {
        console.error("Error loading holdings:", err);
      }
    }
  };

  const loadUserHoldingsFromBlockchain = async () => {
    if (!provider || !walletAddress || availableTokens.length === 0) {
      return;
    }

    try {
      console.log("📊 Loading holdings from blockchain...");
      const updatedHoldings: UserHolding[] = [];

      for (const token of availableTokens) {
        try {
          const tokenContract = new Contract(token.address, CREATOR_TOKEN_ABI, provider);
          const balance = await tokenContract.balanceOf(walletAddress);
          const balanceFormatted = formatUnits(balance, 18);

          // Only include if user has balance
          if (parseFloat(balanceFormatted) > 0) {
            const currentPrice = await tokenContract.getCurrentPrice();
            const priceInEth = formatUnits(currentPrice, 18);
            const totalValue = (parseFloat(balanceFormatted) * parseFloat(priceInEth)).toFixed(6);

            updatedHoldings.push({
              tokenAddress: token.address,
              tokenName: token.name,
              tokenSymbol: token.symbol,
              balance: balanceFormatted,
              value: totalValue
            });
          }
        } catch (err) {
          console.error(`Error loading balance for ${token.symbol}:`, err);
        }
      }

      setUserHoldings(updatedHoldings);
      const holdingsKey = `holdings_${walletAddress}`;
      localStorage.setItem(holdingsKey, JSON.stringify(updatedHoldings));
      
      console.log(`✅ Loaded ${updatedHoldings.length} token holdings from blockchain`);
    } catch (err) {
      console.error("Error loading holdings from blockchain:", err);
    }
  };

  const handleBuyToken = async (token: TokenInfo) => {
    const amount = buyAmount[token.address] || "0";
    
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!signer || !provider) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🔵 Starting purchase of ${amount} USDC worth of ${token.symbol} tokens`);

      // USDC contract address on Base Sepolia
      const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
      
      // Create contract instances
      const tokenContract = new Contract(token.address, CREATOR_TOKEN_ABI, signer);
      const usdcContract = new Contract(
        USDC_ADDRESS,
        ["function approve(address spender, uint256 amount) returns (bool)", "function balanceOf(address) view returns (uint256)", "function allowance(address owner, address spender) view returns (uint256)"],
        signer
      );

      // Convert USDC amount (6 decimals)
      const usdcAmount = parseUnits(amount, 6);
      console.log(`💵 USDC amount to spend: ${amount} USDC`);

      // Check USDC balance
      const usdcBalance = await usdcContract.balanceOf(walletAddress);
      console.log(`💰 Your USDC balance: ${formatUnits(usdcBalance, 6)} USDC`);
      
      if (usdcBalance < usdcAmount) {
        throw new Error(
          `Insufficient USDC balance. You have ${formatUnits(usdcBalance, 6)} USDC but need ${amount} USDC.\n\n` +
          `Get testnet USDC from: https://faucet.circle.com/`
        );
      }

      // Check current allowance
      const currentAllowance = await usdcContract.allowance(walletAddress, token.address);
      console.log(`🔍 Current USDC allowance: ${formatUnits(currentAllowance, 6)} USDC`);

      // Approve USDC if needed
      if (currentAllowance < usdcAmount) {
        console.log("📝 Approving USDC spend...");
        setSuccess("Step 1/2: Approving USDC... Please confirm in MetaMask");
        
        const approveTx = await usdcContract.approve(token.address, usdcAmount);
        console.log(`⏳ Approval transaction sent: ${approveTx.hash}`);
        
        await approveTx.wait();
        console.log("✅ USDC approved!");
      }

      // Calculate minimum tokens (allow 1% slippage)
      const minTokensOut = 0; // Set to 0 for now, can add slippage protection later

      // Buy tokens with USDC
      console.log("📤 Buying tokens...");
      setSuccess("Step 2/2: Buying tokens... Please confirm in MetaMask");
      
      const tx = await tokenContract.buyWithUSDC(usdcAmount, minTokensOut, walletAddress, {
        gasLimit: 500000
      });

      console.log(`⏳ Purchase transaction sent: ${tx.hash}`);
      setSuccess(`Transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Get actual balance from blockchain
      const balance = await tokenContract.balanceOf(walletAddress);
      const actualBalance = formatUnits(balance, 18);
      
      console.log(`🎉 You now have ${actualBalance} ${token.symbol} tokens!`);

      // Update user holdings with real blockchain data
      const holdingsKey = `holdings_${walletAddress}`;
      const currentHoldings = userHoldings.find(h => h.tokenAddress === token.address);
      
      let updatedHoldings: UserHolding[];
      if (currentHoldings) {
        // Update existing holding with blockchain data
        updatedHoldings = userHoldings.map(h => 
          h.tokenAddress === token.address
            ? { 
                ...h, 
                balance: actualBalance,
                value: amount // Value in USDC spent
              }
            : h
        );
      } else {
        // Create new holding with blockchain data
        updatedHoldings = [
          ...userHoldings,
          {
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            balance: actualBalance,
            value: amount // Value in USDC spent
          }
        ];
      }

      setUserHoldings(updatedHoldings);
      localStorage.setItem(holdingsKey, JSON.stringify(updatedHoldings));

      setSuccess(
        `🎉 Successfully purchased ${token.symbol} tokens!\n` +
        `💰 Spent: ${amount} USDC\n` +
        `🪙 Received: ${actualBalance} ${token.symbol}\n` +
        `📝 Transaction: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}\n` +
        `⛽ Gas used: ${receipt.gasUsed.toString()}`
      );
      setBuyAmount({ ...buyAmount, [token.address]: "" });
      
      // Refresh portfolio after purchase
      await loadUserHoldingsFromBlockchain();
      
      // Switch to portfolio tab to show the purchase
      setTimeout(() => setActiveTab("portfolio"), 3000);
      
    } catch (err: any) {
      console.error("❌ Error buying token:", err);
      
      // Parse error messages
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Transaction cancelled by user");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient ETH balance to complete purchase");
      } else if (err.message?.includes("execution reverted")) {
        setError("Transaction failed: " + (err.reason || "Contract execution reverted"));
      } else {
        setError("Failed to purchase tokens: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("buyerLoggedIn");
    localStorage.removeItem("buyerWallet");
    navigate("/login");
  };

  const formatAddress = (address: string) => {
    if (!address) return "Not Connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculatePortfolioValue = () => {
    return userHoldings.reduce((total, holding) => {
      return total + parseFloat(holding.value || "0");
    }, 0).toFixed(2);
  };

  // Show loading while initializing
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Buyer Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center px-4 py-2 rounded-lg bg-white/10">
              <Wallet className="mr-2 h-4 w-4" />
              <span>{formatAddress(walletAddress)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
            {success}
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Portfolio Value</span>
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold">${calculatePortfolioValue()}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Total Holdings</span>
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{userHoldings.length}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Available Tokens</span>
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">{availableTokens.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "marketplace"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <ShoppingCart className="inline mr-2 h-5 w-5" />
            Token Marketplace
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "portfolio"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <TrendingUp className="inline mr-2 h-5 w-5" />
            My Portfolio
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "marketplace" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Available Creator Tokens</h2>
            
            {availableTokens.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 text-lg">No tokens available yet</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for creator tokens!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTokens.map((token) => (
                  <div
                    key={token.address}
                    className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{token.name}</h3>
                        <p className="text-purple-300 text-sm">{token.symbol}</p>
                      </div>
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Price:</span>
                        <span className="text-white font-medium">${token.currentPrice} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white font-medium">{token.totalSupply}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Creator:</span>
                        <span className="text-white font-medium">{formatAddress(token.creator)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder="USDC amount to spend (e.g., 10)"
                        value={buyAmount[token.address] || ""}
                        onChange={(e) => setBuyAmount({ ...buyAmount, [token.address]: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-400"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-sm text-gray-400">
                        💡 Enter USDC amount to spend. You'll receive tokens based on the bonding curve.
                      </p>
                      <button
                        onClick={() => handleBuyToken(token)}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {loading ? "Processing..." : "Buy Tokens"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Token Holdings</h2>
            
            {userHoldings.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 text-lg">No holdings yet</p>
                <p className="text-gray-500 text-sm mt-2">Start by buying some creator tokens!</p>
                <button
                  onClick={() => setActiveTab("marketplace")}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userHoldings.map((holding, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                          <Activity className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{holding.tokenName}</h3>
                          <p className="text-blue-300 text-sm">{holding.tokenSymbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{holding.balance}</div>
                        <div className="text-sm text-gray-400">tokens</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Estimated Value:</span>
                        <span className="text-lg font-semibold text-green-400">${holding.value} USDC</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
