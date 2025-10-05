"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { AddBudgetForm } from "@/components/add-budget";
import { AddLocation } from "@/components/add-location";
import { LocationsList } from "@/components/locations-list";
import { Copy, Wallet, Monitor, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Campaign {
  publicKey: string;
  authority: string;
  name: string;
  description: string;
  budget: string;
  remaining: string;
  spent: string;
  isActive: boolean;
  isPaused: boolean;
  devicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function UserCampaigns() {
  const { wallet } = useWallet();
  

  const [copiedWallet, setCopiedWallet] = useState(false);

  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
  } = api.campaigns.getUserCampaigns.useQuery(
    { userAddress: wallet?.address || "" },
    { enabled: !!wallet?.address, retry: false }
  );

  const formatSOL = (lamports: string) => (parseFloat(lamports) / 1e9).toFixed(2);
  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;
  const getCampaignId = (publicKey: string) => parseInt(publicKey.slice(-8), 16);

  const handleCopyWallet = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const campaigns = campaignsData?.campaigns || [];

  // Mock stats
  const mockStats = {
    devicesConnected: 127,
    totalCollected: 1847.32,
  };

  // Mock data for campaign activity chart - easily replaceable
  const campaignActivityData = [
    { month: "Jan", value: 1200 },
    { month: "Feb", value: 1500 },
    { month: "Mar", value: 1100 },
    { month: "Apr", value: 1800 },
    { month: "May", value: 2200 },
    { month: "Jun", value: 1847 },
  ];

  if (!wallet?.address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/70">
        <p>Please connect your wallet to view your campaigns.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center text-white/70">
        <div>
          <p className="mb-2 text-red-400">Failed to load campaigns.</p>
          <button onClick={() => refetch()} className="text-white/70 hover:text-white transition-colors underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with grid and radial gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)] mx-auto"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Wallet Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              ← Back to Home
            </a>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Wallet className="w-4 h-4 text-white/60" />
              <span className="font-mono text-sm text-white/80">{formatAddress(wallet.address)}</span>
              <button
                onClick={handleCopyWallet}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedWallet && <span className="text-xs text-green-400 ml-1">✓</span>}
            </div>
          </div>

          <div className="text-sm text-white/60">
            <button onClick={() => refetch()} className="hover:text-white transition-colors">
              Refresh ↻
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60">Devices Connected</p>
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold">{mockStats.devicesConnected}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60">Total Collected</p>
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold">{mockStats.totalCollected} SOL</h2>
          </div>
        </div>

        {/* Campaign Activity Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-10">
          <h2 className="text-xl font-semibold mb-6">Campaign Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ fill: '#8b5cf6', r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Campaigns</h2>
          
          {campaigns.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
              <p className="text-white/60 mb-2">No campaigns yet</p>
              <p className="text-white/40 text-sm">Create your first campaign to get started</p>
            </div>
          ) : (
            campaigns.map((campaign: Campaign) => (
              <div
                key={campaign.publicKey}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{campaign.name}</h3>
                    <p className="text-white/60 text-sm">{campaign.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.isActive
                        ? "bg-green-500/10 text-green-400"
                        : campaign.isPaused
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {campaign.isActive ? "Active" : campaign.isPaused ? "Paused" : "Completed"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-white/50 mb-1">Budget</p>
                    <p className="text-lg font-semibold">{formatSOL(campaign.budget)} SOL</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Spent</p>
                    <p className="text-lg font-semibold">{formatSOL(campaign.spent)} SOL</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Remaining</p>
                    <p className="text-lg font-semibold">{formatSOL(campaign.remaining)} SOL</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Devices</p>
                    <p className="text-lg font-semibold">{campaign.devicesCount}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <AddBudgetForm
                    campaignId={getCampaignId(campaign.publicKey)}
                    campaignName={campaign.name}
                    onSuccess={() => refetch()}
                  />
                  <LocationsList
                    campaignId={getCampaignId(campaign.publicKey)}
                    campaignName={campaign.name}
                    onLocationRemoved={() => refetch()}
                  />
                  <AddLocation
                    campaignId={getCampaignId(campaign.publicKey)}
                    campaignName={campaign.name}
                    onSuccess={() => refetch()}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}