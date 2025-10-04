"use client";

import React, { useState, useEffect } from "react";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { LoginButton } from "@/components/login";
import { Wallet } from "lucide-react";

export default function HeroSection() {
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Track current wallet address dynamically
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    if (wallet?.address) {
      setCurrentAddress(wallet.address);
    } else {
      setCurrentAddress(null);
    }
  }, [wallet?.address]);

  const isLoggedIn = wallet != null && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  useEffect(() => {
    if (isLoggedIn && showLogin) {
      setShowLogin(false);
    }
  }, [isLoggedIn, showLogin, authStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d1d5db 1px, transparent 1px),
              linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient Background Blocks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[80px] w-[120px] h-[120px] bg-purple-300/40 transition-all duration-700 hover:bg-blue-300/40 pointer-events-auto" />
        <div className="absolute top-0 left-[280px] w-[80px] h-[80px] bg-purple-200/35 transition-all duration-700 hover:bg-pink-200/35 pointer-events-auto" />
        <div className="absolute top-[40px] right-[200px] w-[120px] h-[120px] bg-purple-300/40 transition-all duration-700 hover:bg-violet-300/40 pointer-events-auto" />
        <div className="absolute top-[80px] right-[80px] w-[80px] h-[80px] bg-purple-200/30 transition-all duration-700 hover:bg-indigo-200/30 pointer-events-auto" />
        <div className="absolute bottom-[160px] left-0 w-[120px] h-[160px] bg-purple-400/50 transition-all duration-700 hover:bg-indigo-400/50 pointer-events-auto" />
        <div className="absolute bottom-[120px] left-[160px] w-[120px] h-[120px] bg-purple-300/40 transition-all duration-700 hover:bg-violet-300/40 pointer-events-auto" />
        <div className="absolute bottom-0 left-[80px] w-[80px] h-[80px] bg-purple-300/35 transition-all duration-700 hover:bg-blue-300/35 pointer-events-auto" />
        <div className="absolute bottom-[120px] right-0 w-[120px] h-[160px] bg-purple-400/50 transition-all duration-700 hover:bg-blue-400/50 pointer-events-auto" />
        <div className="absolute bottom-0 right-[160px] w-[120px] h-[120px] bg-purple-300/45 transition-all duration-700 hover:bg-pink-300/45 pointer-events-auto" />
        <div className="absolute bottom-[40px] right-[80px] w-[80px] h-[80px] bg-purple-200/35 transition-all duration-700 hover:bg-violet-200/35 pointer-events-auto" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 px-8 py-4 flex items-center justify-between max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="7" height="7" rx="1" />
              <rect x="13" y="4" width="7" height="7" rx="1" />
              <rect x="4" y="13" width="7" height="7" rx="1" />
              <rect x="13" y="13" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-3xl font-semibold text-black tracking-tight">
            SoulBoard
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-gray-200/60 backdrop-blur-sm px-8 py-3.5 rounded-full">
          <a
            href="/profile"
            className="text-base font-medium text-gray-700 hover:text-black transition-colors px-5"
          >
            Profile
          </a>
          <div className="w-px h-5 bg-gray-400"></div>
          <a
            href="/providers"
            className="text-base font-medium text-gray-700 hover:text-black transition-colors px-5"
          >
            Providers
          </a>
          <div className="w-px h-5 bg-gray-400"></div>
          <a
            href="/campaigns"
            className="text-base font-medium text-gray-700 hover:text-black transition-colors px-5"
          >
            Campaigns
          </a>
          <div className="w-px h-5 bg-gray-400"></div>
          <a
            href="/locations"
            className="text-base font-medium text-gray-700 hover:text-black transition-colors px-5"
          >
            Locations
          </a>
        </div>

        <div>
          {isLoggedIn && currentAddress ? (
            <button className="bg-black text-white px-8 py-3.5 rounded-full text-base font-semibold inline-flex items-center gap-2.5">
              <Wallet className="w-5 h-5" />
              <span className="font-mono">
                {currentAddress.slice(0, 4)}...{currentAddress.slice(-4)}
              </span>
            </button>
          ) : (
            <LoginButton />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-end justify-center px-8 pb-16">
        <div className="max-w-[1600px] w-full grid grid-cols-12 gap-16 items-end">
          {/* Left Section */}
          <div className="col-span-3 space-y-4 pb-0"></div>

          {/* Center Section */}
          <div className="col-span-6 flex flex-col items-center justify-center pb-8">
            <div className="text-center max-w-4xl">
              <h1 className="text-7xl font-bold text-black mb-10 leading-tight">
                The future of ads
                <br />
                is decentralized.
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xl text-gray-600 mb-12 font-light">
                <span>Imagine all of your</span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Campaigns
                </span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Locations
                </span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Providers
                </span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Analytics
                </span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Payments
                </span>
                <span>and</span>
                <span className="px-5 py-2 border-2 border-gray-400 rounded-xl font-normal bg-white text-black">
                  Transparency
                </span>
                <span>in one blockchain-powered platform.</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-span-3 space-y-4 text-right pb-0"></div>
        </div>
      </div>
    </div>
  );
}