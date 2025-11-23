import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { Wallet, AlertCircle } from "lucide-react";
declare global {
  interface Window {
    ethereum: any;
  }
}
interface WalletConnectProps {
  onConnect: (account: string, provider: any) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = await detectEthereumProvider();

        if (provider) {
          const ethereum = window.ethereum;
          if (ethereum?.isConnected() && ethereum.selectedAddress) {
            setAccount(ethereum.selectedAddress);
            const ethersProvider = new ethers.BrowserProvider(ethereum);
            onConnect(ethereum.selectedAddress, ethersProvider);
          }
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = await detectEthereumProvider();

      if (!provider) {
        throw new Error("MetaMask not detected! Please install MetaMask.");
      }

      const ethereum = window.ethereum;

      if (!ethereum) {
        throw new Error("MetaMask not available");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const selectedAccount = accounts[0];

      setAccount(selectedAccount);

      const ethersProvider = new ethers.BrowserProvider(ethereum);
      onConnect(selectedAccount, ethersProvider);

      // Set up listeners for account changes
      ethereum.on("accountsChanged", (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(newAccounts[0]);
          onConnect(newAccounts[0], new ethers.BrowserProvider(ethereum));
        }
      });
    } catch (err: any) {
      console.error("Error connecting to MetaMask:", err);
      setError(err.message || "Failed to connect to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div>
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center transition-all duration-300"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-transparent hover:border-primary hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 group">
          <div className="relative mr-2">
            <Wallet className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse-dot"></div>
          </div>
          <span className="font-medium">{formatAddress(account)}</span>
        </div>
      )}

      {error && (
        <div className="mt-2 text-destructive flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
