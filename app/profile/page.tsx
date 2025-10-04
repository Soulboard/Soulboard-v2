"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { AddBudgetForm } from "@/components/add-budget";
import { AddLocation } from "@/components/add-location";
import { LocationsList } from "@/components/locations-list";
import { Copy, ArrowLeft, Wallet } from "lucide-react";

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

export default function ProfilePage() {
  const { wallet } = useWallet();
  const [copiedWallet, setCopiedWallet] = useState(false);

  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
  } = api.campaigns.getUserCampaigns.useQuery(
    {
      userAddress: wallet?.address || "",
    },
    {
      enabled: !!wallet?.address,
      retry: false,
    }
  );

  const handleCopyWallet = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const formatSOL = (lamports: string) => {
    const sol = parseFloat(lamports) / 1e9;
    return sol.toFixed(2);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getCampaignId = (publicKey: string) => {
    return parseInt(publicKey.slice(-8), 16);
  };

  const campaigns = campaignsData?.campaigns || [];

  if (!wallet?.address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load campaigns</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header with Wallet */}
        <div className="flex justify-between items-center mb-8">
          {/* Wallet Display */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <span className="font-mono text-sm text-gray-700">
              {wallet?.address ? formatAddress(wallet.address) : ""}
            </span>
            <button 
              onClick={handleCopyWallet}
              className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copiedWallet && (
              <span className="text-xs text-green-600 ml-1">✓</span>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
          <p className="text-gray-500">Track your active campaigns</p>
        </div>

        {/* Campaign Cards */}
        <div className="space-y-6">
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No campaigns yet</p>
              <p className="text-sm text-gray-400">Create your first campaign to get started</p>
            </div>
          ) : (
            campaigns.map((campaign: Campaign) => (
              <div
                key={campaign.publicKey}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Side - Campaign Details */}
                  <div className="flex-1">
                    {/* Campaign Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {campaign.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{campaign.name}</h2>
                        <p className="text-sm text-gray-500">{campaign.description}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Budget</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatSOL(campaign.budget)} SOL
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Spent</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatSOL(campaign.spent)} SOL
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Remaining</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatSOL(campaign.remaining)} SOL
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Devices</p>
                        <p className="text-xl font-bold text-gray-900">
                          {campaign.devicesCount}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
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

                  {/* Right Side - Visual Card */}
                  <div className="lg:w-80 flex-shrink-0">
                    <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 rounded-2xl p-8 h-full flex flex-col items-center justify-center border border-purple-200">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-white text-4xl font-bold">
                          {campaign.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-3">
                          <div className={`w-2 h-2 rounded-full ${campaign.isActive ? 'bg-green-500 animate-pulse' : campaign.isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {campaign.isActive ? "Active" : campaign.isPaused ? "Paused" : "Completed"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}