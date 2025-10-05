"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { Plus, X, MapPin, Monitor, AlertCircle, Building2 } from "lucide-react";

interface AddLocationProps {
  campaignId: number;
  campaignName: string;
  onSuccess?: () => void;
}

export function AddLocation({ campaignId, campaignName, onSuccess }: AddLocationProps) {
  const { wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch campaign details to show existing locations
  const {
    data: campaignDetails,
    isLoading: isLoadingCampaign,
  } = api.campaigns.getCampaignDetails.useQuery(
    { campaignId },
    { enabled: isOpen }
  );

  // Fetch all available providers
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: providersError,
  } = api.provider.getAllProviders.useQuery(undefined, {
    enabled: isOpen,
  });

  // Fetch provider details for the selected provider
  const {
    data: providerDetails,
    isLoading: isLoadingDetails,
  } = api.provider.getProviderDetails.useQuery(
    {
      providerAddress: selectedProvider,
    },
    {
      enabled: !!selectedProvider,
    }
  );

  const addLocationMutation = api.campaigns.addLocation.useMutation({
    onSuccess: () => {
      alert("Location added successfully!");
      setIsOpen(false);
      setSelectedProvider("");
      setDeviceId("");
      onSuccess?.();
    },
    onError: (error) => {
      alert(`Failed to add location: ${error.message}`);
    },
  });

  const handleSubmit = async () => {
    if (!wallet?.address || !selectedProvider || !deviceId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addLocationMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        campaignId,
        location: selectedProvider,
        deviceId: parseInt(deviceId),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const providers = providersData?.providers || [];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
      >
        <Plus className="w-3 h-3" />
        Add Location
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60  overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Add Location to Campaign</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-white/60 mb-6">
          Add a new provider location to "{campaignName}" campaign
        </p>

        {/* Existing Locations Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Current Locations in Campaign</h4>
          {isLoadingCampaign ? (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/60">
              Loading current locations...
            </div>
          ) : !campaignDetails ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">Unable to load campaign details</p>
            </div>
          ) : !campaignDetails.locations || campaignDetails.locations.length === 0 ? (
            <div className="p-4 border border-dashed border-white/20 rounded-xl text-center bg-white/5">
              <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">No locations added to this campaign yet</p>
              <p className="text-white/40 text-xs mt-1">Add your first location below</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {campaignDetails.locations.map((locationAddress: string, index: number) => (
                <ExistingLocationItem
                  key={locationAddress}
                  address={locationAddress}
                  index={index + 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-semibold text-white mb-4">Add New Location</h4>

          <div className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select Provider Location *
              </label>
              {isLoadingProviders ? (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/60">
                  Loading providers...
                </div>
              ) : providersError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">Error loading providers: {providersError.message}</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
                  No providers available. Register providers first.
                </div>
              ) : (
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-zinc-900">Choose a provider location</option>
                  {providers.map((providerAddress: string) => (
                    <option key={providerAddress} value={providerAddress} className="bg-zinc-900">
                      {providerAddress.slice(0, 8)}...{providerAddress.slice(-8)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Provider Details */}
            {selectedProvider && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Provider Details
                </h4>
                {isLoadingDetails ? (
                  <div className="text-sm text-white/60">Loading details...</div>
                ) : providerDetails ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Status:</span>
                      <span className={providerDetails.adProvider.isActive ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        {providerDetails.adProvider.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Name:</span>
                      <span className="text-white">{providerDetails.adProvider.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Location:</span>
                      <span className="text-white">{providerDetails.adProvider.location || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Rating:</span>
                      <span className="text-white">{providerDetails.adProvider.rating}/5</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-400">
                    Failed to load provider details
                  </div>
                )}
              </div>
            )}

            {/* Device ID */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Device ID *
              </label>
              <input
                type="number"
                placeholder="Enter device ID (e.g., 1)"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
              <p className="text-xs text-white/50 mt-1.5">
                Unique identifier for the device at this location
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !selectedProvider || 
                !deviceId || 
                isSubmitting || 
                !wallet?.address ||
                !providerDetails?.adProvider.isActive
              }
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                !selectedProvider || !deviceId || isSubmitting || !wallet?.address || !providerDetails?.adProvider.isActive
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-black rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExistingLocationItemProps {
  address: string;
  index: number;
}

function ExistingLocationItem({ address, index }: ExistingLocationItemProps) {
  const {
    data: providerDetails,
    isLoading,
  } = api.provider.getProviderDetails.useQuery({
    providerAddress: address,
  });

  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-semibold border border-blue-500/30">
              #{index}
            </span>
            <span className="text-sm font-mono text-white">
              {address.slice(0, 8)}...{address.slice(-8)}
            </span>
            {isLoading && (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </div>
          {providerDetails && (
            <div className="space-y-1 ml-1">
              <div className="text-xs">
                <span className="text-white/50">Name:</span>{" "}
                <span className="text-white/80">{providerDetails.adProvider.name || "Unknown"}</span>
              </div>
              <div className="text-xs">
                <span className="text-white/50">Location:</span>{" "}
                <span className="text-white/80">{providerDetails.adProvider.location || "Unknown"}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
            providerDetails?.adProvider.isActive 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {providerDetails?.adProvider.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}