"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { AddBudgetForm } from "@/components/add-budget";

type CampaignStatus = "active" | "paused" | "completed" | "cancelled";

interface Campaign {
  publicKey: string;
  authority: string;
  campaignId: number;
  campaignName: string;
  campaignDescription: string;
  campaignBudget: string;
  campaignStatus: { [key: string]: any };
  campaignProviders: string[];
  campaignLocations: string[];
  runningDays: number;
  hoursPerDay: number;
  baseFeePerHour: string;
  platformFee: string;
  totalDistributed: string;
  campaignPerformance: any[];
}

export function UserCampaigns() {
  const { wallet } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
  } = api.contracts.getUserCampaigns.useQuery(
    {
      userAddress: wallet?.address || "",
    },
    {
      enabled: !!wallet?.address,
      retry: false,
    }
  );

  // Auto-refresh campaigns periodically
  useEffect(() => {
    if (wallet?.address) {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [wallet?.address, refetch]);

  const formatSOL = (lamports: string) => {
    const sol = parseFloat(lamports) / 1e9;
    return sol.toFixed(4);
  };

  const getStatusColor = (status: { [key: string]: any }): string => {
    const statusKey = Object.keys(status)[0];
    switch (statusKey) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: { [key: string]: any }): string => {
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

  if (!wallet?.address) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-lg font-medium mb-2">My Campaigns</h2>
        <p className="text-gray-500 text-sm">Connect your wallet to view your campaigns</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-lg font-medium mb-4">My Campaigns</h2>
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-lg font-medium mb-2">My Campaigns</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">Failed to load campaigns: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="text-red-800 hover:text-red-900 underline text-sm mt-1"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const campaigns = campaignsData?.campaigns || [];
  const totalCampaigns = campaignsData?.total || 0;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">My Campaigns</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {totalCampaigns} campaign{totalCampaigns !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => refetch()}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Refresh campaigns"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {totalCampaigns === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-2">No campaigns created yet</p>
          <p className="text-gray-400 text-xs">Create your first campaign to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns
            .slice(0, isExpanded ? campaigns.length : 3)
            .map((campaign: Campaign) => (
              <div
                key={campaign.publicKey}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.campaignName}</h3>
                    <p className="text-sm text-gray-500">ID: {campaign.campaignId}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      campaign.campaignStatus
                    )}`}
                  >
                    {getStatusText(campaign.campaignStatus)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {campaign.campaignDescription}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <p className="font-medium">{formatSOL(campaign.campaignBudget)} SOL</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{campaign.runningDays} days</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Hours/Day:</span>
                    <p className="font-medium">{campaign.hoursPerDay}h</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <p className="font-medium">{formatSOL(campaign.baseFeePerHour)} SOL/h</p>
                  </div>
                </div>
                
                {campaign.campaignProviders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {campaign.campaignProviders.length} provider{campaign.campaignProviders.length !== 1 ? "s" : ""} • 
                      {campaign.campaignLocations.length} location{campaign.campaignLocations.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Add Budget Section */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Distributed: {formatSOL(campaign.totalDistributed)} SOL
                  </span>
                  <AddBudgetForm 
                    campaignId={campaign.campaignId}
                    campaignName={campaign.campaignName}
                    onSuccess={() => refetch()}
                  />
                </div>
              </div>
            ))}
          
          {campaigns.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {isExpanded ? "Show Less" : `Show ${campaigns.length - 3} More`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
