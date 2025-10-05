"use client"

import { useState, useEffect } from "react"
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui"
import { LoginButton } from "@/components/login"
import { Wallet } from "lucide-react"

export default function HeroSection() {
  const { wallet, status: walletStatus } = useWallet()
  const { status: authStatus } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)

  useEffect(() => {
    if (wallet?.address) {
      setCurrentAddress(wallet.address)
    } else {
      setCurrentAddress(null)
    }
  }, [wallet?.address])

  const isLoggedIn = wallet != null && authStatus === "logged-in"
  const isLoading = walletStatus === "in-progress" || authStatus === "initializing"

  useEffect(() => {
    if (isLoggedIn && showLogin) {
      setShowLogin(false)
    }
  }, [isLoggedIn, showLogin, authStatus])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen relative bg-black overflow-hidden flex flex-col">
      {/* New background with grid and radial gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)] mx-auto"></div>

      {/* Navigation */}
      <nav className="relative z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 border-b border-white/10">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white tracking-tight">
                SoulBoard
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <a
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Profile
              </a>
              <a
                href="/providers"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Providers
              </a>
              <a
                href="/campaigns"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Campaigns
              </a>
              <a
                href="/locations"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Locations
              </a>
            </div>

            {/* Wallet Button */}
            <div>
              {isLoggedIn && currentAddress ? (
                <button
                  aria-label="Connected wallet"
                  className="group relative overflow-hidden bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 hover:bg-white/90 transition-colors"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    style={{
                      background: "linear-gradient(120deg, transparent 0%, rgba(0,0,0,0.1) 40%, transparent 80%)",
                    }}
                  />
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono">
                    {currentAddress.slice(0, 4)}...{currentAddress.slice(-4)}
                  </span>
                </button>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-8">
        <div className="max-w-6xl w-full text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            Decentralized advertising
            <br />
            for the modern world
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect advertisers with digital signage providers through blockchain technology. Transparent, secure, and efficient campaign management.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-sm font-medium text-white/80">Campaign Management</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm font-medium text-white/80">Digital Signage</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-sm font-medium text-white/80">Blockchain Powered</span>
            </div>
          </div>
        </div>

        {/* Decorative grid pattern - smaller and shifted down */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none opacity-[0.025]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
    </div>
  )
}