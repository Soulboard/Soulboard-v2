"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { AddBudgetForm } from "@/components/add-budget";
import { AddLocation } from "@/components/add-location";
import { LocationsList } from "@/components/locations-list";
import { Copy, Wallet, Monitor, DollarSign, Activity, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

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

  // Oracle data queries
  const { data: allDeviceFeeds, isLoading: loadingOracle, refetch: refetchOracle } = api.oracle.getAllDeviceFeeds.useQuery();
  const { data: thingSpeakData, refetch: refetchThingSpeak } = api.oracle.getThingSpeakData.useQuery({ results: 30 });
  const { data: channelFeed, refetch: refetchChannel } = api.oracle.getChannelFeed.useQuery();

  const handleRefreshAll = () => {
    refetch();
    refetchOracle();
    refetchThingSpeak();
    refetchChannel();
  };

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

  // Calculate real stats from oracle data
  const realStats = useMemo(() => {
    if (!allDeviceFeeds || !channelFeed) {
      return {
        devicesConnected: 0,
        totalViews: 0,
        totalCollected: 0,
        averageViewsPerDevice: 0,
      };
    }

    const totalViews = allDeviceFeeds.statistics.totalViews;
    const devicesConnected = allDeviceFeeds.statistics.totalFeeds;
    
    // Calculate estimated earnings based on views only
    // 0.0001 SOL per view
    const estimatedEarnings = totalViews * 0.0001;

    return {
      devicesConnected,
      totalViews,
      totalCollected: estimatedEarnings,
      averageViewsPerDevice: devicesConnected > 0 ? totalViews / devicesConnected : 0,
    };
  }, [allDeviceFeeds, channelFeed]);

  // Process ThingSpeak data for chart
  const chartData = useMemo(() => {
    if (!thingSpeakData?.feeds) return [];

    // Group feeds by day and calculate daily totals
    const dailyData = thingSpeakData.feeds.reduce((acc, feed) => {
      const date = new Date(feed.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[date]) {
        acc[date] = { date, views: 0, earnings: 0, entries: 0 };
      }
      
      acc[date].views += feed.views;
      acc[date].earnings += feed.views * 0.0001; // Calculate earnings from views
      acc[date].entries += 1;
      
      return acc;
    }, {} as Record<string, { date: string; views: number; earnings: number; entries: number }>);

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [thingSpeakData]);

  if (!wallet?.address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/70">
        <p>Please connect your wallet to view your campaigns.</p>
      </div>
    );
  }

  if (isLoading || loadingOracle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            />
          </div>
          <p className="text-white/60">
            {isLoading && "Loading campaigns..."}
            {loadingOracle && "Loading oracle data..."}
          </p>
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
            
            {/* Oracle Status Indicator */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${
                allDeviceFeeds ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-white/60">
                {allDeviceFeeds ? 'Oracle Online' : 'Oracle Offline'}
              </span>
            </div>
          </div>

          <div className="text-sm text-white/60">
            <button onClick={handleRefreshAll} className="hover:text-white transition-colors flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Refresh All ↻
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60">Devices Connected</p>
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold">
              {loadingOracle ? "..." : realStats.devicesConnected}
            </h2>
            <p className="text-xs text-white/40 mt-1">Oracle feeds active</p>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60">Total Views</p>
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold">
              {loadingOracle ? "..." : realStats.totalViews.toLocaleString()}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              Avg: {realStats.averageViewsPerDevice.toFixed(0)}/device
            </p>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60">Total Earnings</p>
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold">
              {loadingOracle ? "..." : realStats.totalCollected.toFixed(3)} SOL
            </h2>
            <p className="text-xs text-white/40 mt-1">0.0001 SOL per view</p>
          </div>
        </div>

        {/* Real-time Performance Chart */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Performance & Earnings (Last 14 Days)</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white/60">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white/60">Earnings (SOL)</span>
              </div>
            </div>
          </div>
          
          {loadingOracle || !chartData.length ? (
            <div className="h-[300px] flex items-center justify-center text-white/50">
              {loadingOracle ? "Loading performance data..." : "No performance data available"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis 
                  yAxisId="views"
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  orientation="left"
                />
                <YAxis 
                  yAxisId="earnings"
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  orientation="right"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    name === 'views' ? `${value} views` : `${Number(value).toFixed(4)} SOL`,
                    name === 'views' ? 'Views' : 'Earnings'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  yAxisId="views"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  yAxisId="earnings"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ThingSpeak Integration Status */}
        {channelFeed && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ThingSpeak Integration</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/50 mb-1">Channel ID</p>
                <p className="font-mono">{channelFeed.channelId}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Last Entry</p>
                <p className="font-mono">{channelFeed.lastEntryId}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Total Views</p>
                <p className="font-semibold">{channelFeed.totalViewsNumber.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Campaigns</h2>
            <div className="text-xs text-white/40">
              {allDeviceFeeds && (
                <span>Oracle data: {new Date(allDeviceFeeds.meta.fetchedAt).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-white/60 mb-2">No campaigns yet</p>
              <p className="text-white/40 text-sm">Create your first campaign to get started</p>
            </div>
          ) : (
            campaigns.map((campaign: Campaign) => {
              // Get performance data for this campaign's devices if available
              const campaignDeviceFeeds = allDeviceFeeds?.feeds.filter(feed => 
                // This is a simplified match - in reality you'd need to track which devices belong to which campaigns
                feed.isDefaultChannel
              ) || [];
              
              const campaignPerformance = campaignDeviceFeeds.reduce(
                (acc, feed) => ({
                  views: acc.views + feed.totalViewsNumber,
                  devices: acc.devices + 1,
                }),
                { views: 0, devices: 0 }
              );
              
              // Calculate earnings based on views only
              const campaignEarnings = campaignPerformance.views * 0.0001; // 0.0001 SOL per view

              return (
                <div
                  key={campaign.publicKey}
                  className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
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

                  {/* Performance Metrics */}
                  {allDeviceFeeds && campaignPerformance.devices > 0 && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Live Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <p className="text-xs text-white/50">Views</p>
                          </div>
                          <p className="text-lg font-semibold text-blue-400">
                            {campaignPerformance.views.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <p className="text-xs text-white/50">Earnings</p>
                          </div>
                          <p className="text-lg font-semibold text-green-400">
                            {campaignEarnings.toFixed(4)} SOL
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}