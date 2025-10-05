"use client";

import { useState } from "react";
import { MapPin, X, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { any } from "zod";

export default function LocationsPage() {
  const { wallet } = useWallet();
  const [selected, setSelected] = useState<any>(null);
  const [showCampaignSelect, setShowCampaignSelect] = useState(false);
  const [providerDetails, setProviderDetails] = useState<any[]>([]);

  // Fetch all provider addresses
  const { data: providersData, isLoading, error } = api.provider.getAllProviders.useQuery();
  const providerAddresses = providersData?.providers || [];

  // Fetch details for each provider
  const providerQueries = providerAddresses.map((address: string) =>
    api.provider.getProviderDetails.useQuery(
      { providerAddress: address },
      { enabled: !!address }
    )
  );

  // Combine all provider details
  const providers = providerQueries
    .filter((query: any) => query.data)
    .map((query: any) => query.data);

  const isLoadingDetails = providerQueries.some((query: any) => query.isLoading);

  // Fetch user campaigns for booking
  const { data: campaignsData } = api.campaigns.getUserCampaigns.useQuery(
    { userAddress: wallet?.address || "" },
    { enabled: !!wallet?.address && showCampaignSelect }
  );
  const campaigns = campaignsData?.campaigns || [];

  const addLocationMutation = api.campaigns.addLocation.useMutation({
    onSuccess: () => {
      alert("Location added to campaign successfully!");
      setShowCampaignSelect(false);
      setSelected(null);
    },
    onError: (error) => {
      alert(`Failed to add location: ${error.message}`);
    },
  });

  const handleBookLocation = (provider: any) => {
    if (!wallet?.address) {
      alert("Please connect your wallet to book a location");
      return;
    }
    setSelected(provider);
    setShowCampaignSelect(true);
  };

  const handleSelectCampaign = async (campaignId: number) => {
    if (!wallet?.address || !selected) return;

    // Generate a unique device ID (you can customize this logic)
    const deviceId = Math.floor(Math.random() * 1000000);

    try {
      await addLocationMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        campaignId,
        location: selected.address,
        deviceId,
      });
    } catch (error) {
      console.error("Failed to add location:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with grid and radial gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)] mx-auto"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Back to Home Button */}
        <div className="mb-10">
          <a
            href="/"
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>

        {/* Hero Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Advertising Locations
          </h1>
          <p className="text-lg text-white/60">
            Browse provider-owned locations and book directly for your campaigns
          </p>
        </div>

        {/* Loading State */}
        {(isLoading || isLoadingDetails) && (
          <div className="text-center py-16">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              />
            </div>
            <p className="text-white/60 text-lg mt-4">Loading available locations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
            <p className="text-red-400 text-center">Failed to load locations: {error.message}</p>
          </div>
        )}

        {/* Grid of Location Cards */}
        {!isLoading && !error && providers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider: any) => {
              const adProvider = provider.adProvider || {};
              const isAvailable = adProvider.isActive ?? true;
              
              return (
                <div
                  key={provider.address}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isAvailable
                          ? "bg-green-500/10 text-green-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {isAvailable ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Booked
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {adProvider.name || 'Unknown Location'}
                    </h3>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {adProvider.description || 'High visibility location, ideal for brand campaigns.'}
                    </p>
                    
                    <div className="space-y-1 text-xs text-white/50 mb-3">
                      <p>
                        <span className="font-medium">Location:</span> {adProvider.location || 'Not specified'}
                      </p>
                      <p className="font-mono text-xs">
                        {provider.address?.slice(0, 12)}...{provider.address?.slice(-12)}
                      </p>
                    </div>
                    
                    <p className="text-2xl font-bold text-white">
                      {adProvider.pricePerDay ? `${adProvider.pricePerDay} SOL/day` : 'Contact for pricing'}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => handleBookLocation(provider)}
                    disabled={!isAvailable}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isAvailable
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "bg-white/5 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {isAvailable ? "Book Location" : "Not Available"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && providers && providers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-lg mb-2">No locations available at the moment</p>
            <p className="text-white/40">Check back later for new advertising locations</p>
          </div>
        )}
      </div>

      {/* Campaign Selection Modal */}
      {showCampaignSelect && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => {
                setShowCampaignSelect(false);
                setSelected(null);
              }}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">
              Select Campaign
            </h2>
            <p className="text-white/60 mb-6">
              Choose which campaign to add "{selected.adProvider?.name || 'this location'}" to
            </p>

            {campaigns.length === 0 ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-white/60 mb-2">No campaigns available</p>
                <p className="text-white/40 text-sm">Create a campaign first to book locations</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {campaigns.map((campaign: any, index: number) => (
                  <button
                    key={campaign.publicKey || `campaign-${index}`}
                    onClick={() => handleSelectCampaign(parseInt(campaign.publicKey.slice(-8), 16))}
                    disabled={addLocationMutation.isPending}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{campaign.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {campaign.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{campaign.description}</p>
                    <div className="flex gap-4 text-xs text-white/50">
                      <span>Budget: {(parseFloat(campaign.budget) / 1e9).toFixed(2)} SOL</span>
                      <span>Devices: {campaign.devicesCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCampaignSelect(false);
                  setSelected(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}