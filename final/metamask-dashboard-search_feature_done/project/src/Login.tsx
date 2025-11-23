import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "./hooks/useAuth";

export default function Login() {
  const [activeTab, setActiveTab] = useState(0);
  const [userType, setUserType] = useState<"creator" | "buyer">("creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    setError(null);
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
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
      
      setIsConnecting(false);
      return selectedAccount;
    } catch (error: any) {
      setIsConnecting(false);
      setError('Failed to connect wallet: ' + error.message);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const walletAddress = await connectWallet();
      if (!walletAddress) return;
      
      // Simulate successful login
      if (userType === "creator") {
        localStorage.setItem('creatorLoggedIn', 'true');
        localStorage.setItem('creatorWallet', walletAddress);
        localStorage.setItem('creatorEmail', email);
        navigate('/creator-dashboard');
      } else {
        localStorage.setItem('buyerLoggedIn', 'true');
        localStorage.setItem('buyerWallet', walletAddress);
        localStorage.setItem('buyerEmail', email);
        navigate('/buyer-dashboard');
      }
    } catch (error: any) {
      setError('Login failed: ' + error.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !confirmPassword || !username) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const walletAddress = await connectWallet();
      if (!walletAddress) return;
      
      // Simulate successful signup
      if (userType === "creator") {
        localStorage.setItem('creatorLoggedIn', 'true');
        localStorage.setItem('creatorWallet', walletAddress);
        localStorage.setItem('creatorEmail', email);
        localStorage.setItem('creatorUsername', username);
        navigate('/creator-dashboard');
      } else {
        localStorage.setItem('buyerLoggedIn', 'true');
        localStorage.setItem('buyerWallet', walletAddress);
        localStorage.setItem('buyerEmail', email);
        localStorage.setItem('buyerUsername', username);
        navigate('/buyer-dashboard');
      }
    } catch (error: any) {
      setError('Signup failed: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      
      // Sign in with Google
      const user = await signInWithGoogle();
      
      if (!user) {
        throw new Error('Failed to sign in with Google');
      }

      // Connect wallet after Google sign-in
      const walletAddress = await connectWallet();
      if (!walletAddress) {
        setIsGoogleLoading(false);
        return;
      }

      // Store user information
      const userEmail = user.email || '';
      const displayName = user.displayName || userEmail.split('@')[0];
      const photoURL = user.photoURL || '';

      if (userType === "creator") {
        localStorage.setItem('creatorLoggedIn', 'true');
        localStorage.setItem('creatorWallet', walletAddress);
        localStorage.setItem('creatorEmail', userEmail);
        localStorage.setItem('creatorUsername', displayName);
        localStorage.setItem('creatorPhotoURL', photoURL);
        localStorage.setItem('firebaseUID', user.uid);
        navigate('/creator-dashboard');
      } else {
        localStorage.setItem('buyerLoggedIn', 'true');
        localStorage.setItem('buyerWallet', walletAddress);
        localStorage.setItem('buyerEmail', userEmail);
        localStorage.setItem('buyerUsername', displayName);
        localStorage.setItem('buyerPhotoURL', photoURL);
        localStorage.setItem('firebaseUID', user.uid);
        navigate('/buyer-dashboard');
      }
    } catch (error: any) {
      setError('Google sign-in failed: ' + error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Creator-Tok</h1>
        
        {/* User Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">I am a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType("creator")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                userType === "creator"
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border hover:border-primary/50"
              }`}
            >
              🎨 Creator
            </button>
            <button
              type="button"
              onClick={() => setUserType("buyer")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                userType === "buyer"
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border hover:border-primary/50"
              }`}
            >
              💰 Investor
            </button>
          </div>
        </div>
        
        <div className="flex mb-6 border-b border-border">
          <button 
            className={`flex-1 py-2 text-center ${activeTab === 0 ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => handleTabChange(0)}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-2 text-center ${activeTab === 1 ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => handleTabChange(1)}
          >
            Sign Up
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isConnecting}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-md flex justify-center items-center hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGoogleLoading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        {activeTab === 0 ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md flex justify-center items-center"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="signup-email">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md flex justify-center items-center"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}