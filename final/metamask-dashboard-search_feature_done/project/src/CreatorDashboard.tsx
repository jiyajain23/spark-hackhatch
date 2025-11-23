import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider } from "ethers";
import { Wallet, LogOut, Plus, Coins, AlertCircle, CheckCircle2 } from "lucide-react";
import { useContracts } from "./hooks/useContracts";

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  supply: string;
  price: string;
  holders: number;
  marketCap: string;
}

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [creatorTokens, setCreatorTokens] = useState<TokenInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<string>("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  const contracts = useContracts(provider, signer);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("creatorLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Get wallet address from localStorage
    const storedWallet = localStorage.getItem("creatorWallet");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }

    // Initialize provider and signer
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new BrowserProvider(window.ethereum);
          const accounts = await browserProvider.listAccounts();
          if (accounts.length > 0) {
            const web3Signer = await browserProvider.getSigner();
            const signerAddress = await web3Signer.getAddress();
            setWalletAddress(signerAddress);
            localStorage.setItem("creatorWallet", signerAddress);
            setProvider(browserProvider);
            setSigner(web3Signer);
          }
          
          // Get all available accounts
          if (window.ethereum.request) {
            const allAccounts = await window.ethereum.request({ 
              method: 'eth_accounts' 
            });
            setAvailableAccounts(allAccounts);
          }
        } catch (err) {
          console.error("Failed to initialize web3:", err);
        }
      }
    };

    initWeb3();

    // Poll for account changes instead of using event listeners
    // This avoids MetaMask's addEventListener compatibility issues
    if (window.ethereum && signer) {
      const checkAccountInterval = setInterval(async () => {
        try {
          const currentAddress = await signer.getAddress();
          if (currentAddress && currentAddress !== walletAddress) {
            setWalletAddress(currentAddress);
            localStorage.setItem("creatorWallet", currentAddress);
            window.location.reload();
          }
        } catch (error) {
          console.error("Error checking account:", error);
        }
      }, 2000); // Check every 2 seconds

      return () => {
        clearInterval(checkAccountInterval);
      };
    }

    // Load saved tokens from localStorage
    const savedTokens = localStorage.getItem("creatorTokens");
    if (savedTokens) {
      try {
        setCreatorTokens(JSON.parse(savedTokens));
      } catch (err) {
        console.error("Failed to parse saved tokens:", err);
      }
    }
  }, [navigate]);

  // Check current network
  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          
          if (chainId === 84532) {
            setCurrentNetwork("Base Sepolia ✓");
            setIsWrongNetwork(false);
          } else if (chainId === 43113) {
            setCurrentNetwork("Avalanche Fuji (Wrong!)");
            setIsWrongNetwork(true);
            setError(`Wrong network detected! You're on Avalanche Fuji (Chain ID: 43113). Please switch to Base Sepolia.`);
          } else {
            setCurrentNetwork(`Chain ${chainId} (Wrong!)`);
            setIsWrongNetwork(true);
            setError(`Wrong network detected! Please switch to Base Sepolia (Chain ID: 84532).`);
          }
        } catch (err) {
          console.error("Failed to check network:", err);
        }
      }
    };

    checkNetwork();

    // Listen for network changes using a simpler approach
    // Poll for network changes instead of using event listeners
    const intervalId = setInterval(async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          
          // If network changed, reload the page
          if (currentNetwork && chainId === 84532 && currentNetwork.includes("Wrong")) {
            window.location.reload();
          } else if (currentNetwork && chainId !== 84532 && !currentNetwork.includes("Wrong")) {
            window.location.reload();
          }
        } catch (err) {
          // Ignore errors during polling
        }
      }
    }, 2000); // Check every 2 seconds

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [provider, currentNetwork]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("creatorLoggedIn");
    localStorage.removeItem("creatorWallet");
    localStorage.removeItem("creatorEmail");
    localStorage.removeItem("creatorUsername");
    navigate("/login");
  };

  const handleSwitchAccount = async () => {
    // Prevent multiple simultaneous requests
    if (isSwitchingAccount) {
      return;
    }

    try {
      setIsSwitchingAccount(true);
      setError(null);

      if (!window.ethereum) {
        setError('MetaMask not detected');
        return;
      }

      // Request account change - this will open MetaMask to let user select account
      const accounts = await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      }).then(() => {
        if (window.ethereum) {
          return window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        return [];
      });

      if (accounts && accounts.length > 0) {
        setSuccess(`Switched to account: ${formatAddress(accounts[0])}`);
        // Page will reload automatically due to accountsChanged listener
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Account switch cancelled');
      } else if (err.code === -32002) {
        setError('Please check MetaMask - there is a pending request');
      } else {
        setError('Failed to switch account: ' + err.message);
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const saveTokensToStorage = (tokens: TokenInfo[]) => {
    localStorage.setItem("creatorTokens", JSON.stringify(tokens));
  };

  const switchToBaseSepolia = async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected');
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      });
      // Reload the page after network switch
      window.location.reload();
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
              },
            ],
          });
          // Reload the page after adding network
          window.location.reload();
        } catch (addError) {
          setError('Failed to add Base Sepolia network to MetaMask');
        }
      } else {
        setError('Failed to switch to Base Sepolia network');
      }
    }
  };

  const handleLaunchToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!tokenName || !tokenSymbol || !tokenSupply || !tokenPrice) {
      setError("Please fill in all fields");
      return;
    }

    if (!provider || !signer) {
      setError("Please connect your wallet first");
      return;
    }

    if (!contracts) {
      setError("Contracts are still loading. Please wait...");
      return;
    }

    try {
      setLoading(true);

      // Ensure we're on Base Sepolia
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      if (currentChainId !== 84532) {
        setError(`Wrong network! You're on chain ID ${currentChainId}. Please switch to Base Sepolia (84532) or click the button below.`);
        setLoading(false);
        return;
      }

      // Get the creator address
      const creatorAddress = await signer.getAddress();

      // Create token parameters
      const params = {
        creator: creatorAddress,
        name: tokenName,
        symbol: tokenSymbol,
        basePrice: tokenPrice,
        k: "0.00001",
        initialSupplyLimit: tokenSupply,
        minTokensForAccess: "100",
        creatorBuyFeeBps: 300,
        creatorSellFeeBps: 300,
        maxSellPercentBps: 1000,
        sellWindowSeconds: 3600,
        sellWindowThresholdBps: 500
      };

      console.log("Creating token with params:", params);

      setSuccess("Sending transaction...");

      // Use the createCreatorToken function from the hook
      const result = await contracts.createCreatorToken(params);
      
      console.log("Token created at:", result.tokenAddress);

      const newToken: TokenInfo = {
        address: result.tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        price: `${tokenPrice} ETH`,
        holders: 1,
        marketCap: "$0",
      };

      const updatedTokens = [newToken, ...creatorTokens];
      setCreatorTokens(updatedTokens);
      saveTokensToStorage(updatedTokens);

      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
      setTokenPrice("");

      setSuccess(`Token "${tokenName}" launched successfully! Address: ${formatAddress(result.tokenAddress)}`);
      
      setTimeout(() => {
        setActiveTab(0);
        setSuccess(null);
      }, 3000);

    } catch (error: any) {
      console.error("Error launching token:", error);
      setError(error.message || "Failed to launch token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Creator Dashboard</h1>
          <div className="flex items-center space-x-4">
            {currentNetwork && (
              <div className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                isWrongNetwork 
                  ? 'bg-red-500/10 text-red-500 border border-red-500' 
                  : 'bg-green-500/10 text-green-500 border border-green-500'
              }`}>
                <span>{currentNetwork}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchAccount}
                disabled={isSwitchingAccount}
                className={`flex items-center px-3 py-1 rounded-lg text-white text-sm transition-all ${
                  isSwitchingAccount 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Switch Account"
              >
                <Wallet className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">
                  {isSwitchingAccount ? 'Switching...' : 'Switch'}
                </span>
              </button>
              <div className="flex items-center px-3 py-1 rounded-lg bg-secondary text-secondary-foreground">
                <Wallet className="mr-2 h-4 w-4" />
                <span>{formatAddress(walletAddress)}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-secondary"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-500">{error}</p>
              <div className="mt-2 flex gap-2">
                {error.includes('Wrong network') || error.includes('chain ID') ? (
                  <button
                    onClick={switchToBaseSepolia}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                  >
                    Switch to Base Sepolia
                  </button>
                ) : null}
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-400 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-500">{success}</p>
            </div>
          </div>
        )}

        <div className="flex mb-6 border-b border-border">
          <button
            className={`py-2 px-4 ${
              activeTab === 0
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab(0)}
          >
            Dashboard
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 1
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab(1)}
          >
            Launch Token
          </button>
        </div>

        {activeTab === 0 && (
          <div>
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Your Creator Tokens</h2>
                <button
                  onClick={() => setActiveTab(1)}
                  className="flex items-center text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Token
                </button>
              </div>

              {creatorTokens.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <p>You haven't launched any tokens yet.</p>
                  <button
                    onClick={() => setActiveTab(1)}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Launch Your First Token
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creatorTokens.map((token, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            {token.name} ({token.symbol})
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatAddress(token.address)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {token.price}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Supply: {token.supply}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground">Holders</div>
                          <div className="font-medium">{token.holders}</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground">Market Cap</div>
                          <div className="font-medium">{token.marketCap}</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex gap-2">
                        <button
                          onClick={() => window.open(`https://sepolia.basescan.org/address/${token.address}`, '_blank')}
                          className="flex-1 text-sm px-3 py-1 rounded-md border border-border hover:bg-secondary"
                        >
                          View on Explorer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Launch Your Creator Token</h2>
            <form onSubmit={handleLaunchToken}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="e.g. My Creator Token"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The name of your creator token
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="e.g. MCT"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    A short symbol for your token (e.g., BTC, ETH)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Initial Supply
                  </label>
                  <input
                    type="number"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="e.g. 1000000"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The total number of tokens to create
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Initial Price (ETH)
                  </label>
                  <input
                    type="number"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="e.g. 0.001"
                    step="0.000001"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The initial price per token in ETH
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                      Launching Token...
                    </>
                  ) : (
                    "Launch Token"
                  )}
                </button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Note: Make sure you're connected to Base Sepolia network and have enough ETH for gas fees.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}