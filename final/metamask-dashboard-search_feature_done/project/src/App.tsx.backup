import React from "react";
import { Link } from "react-router-dom";
import { Coins, Zap, Shield, TrendingUp } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Creator-Tok
            </span>
          </div>
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tokenize Your Creator Economy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Launch your own token, build a community, and monetize your content
            like never before. Join the future of creator-fan relationships.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl text-lg font-semibold"
            >
              Launch Your Token
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 text-lg font-semibold"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Creator-Tok?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Easy Token Launch</h3>
            <p className="text-gray-600">
              Create your own token in minutes. No coding required. Set your
              price, supply, and start building your community.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Secure & Transparent</h3>
            <p className="text-gray-600">
              Built on Base blockchain with audited smart contracts. Every
              transaction is transparent and verifiable.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Grow Your Revenue</h3>
            <p className="text-gray-600">
              Monetize your community through token trading. Earn fees on every
              transaction and build sustainable income.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Creators</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">$10M+</div>
              <div className="text-blue-100">Volume Traded</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Launch Your Token?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who are already building their token
            economy.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl text-lg font-semibold"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Coins className="h-6 w-6" />
            <span className="text-xl font-bold">Creator-Tok</span>
          </div>
          <p className="text-gray-400">
            Built on Base • Powered by Blockchain
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2025 Creator-Tok. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
