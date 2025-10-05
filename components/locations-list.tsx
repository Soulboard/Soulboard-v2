"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { X, MapPin, Building2, AlertCircle } from "lucide-react";

interface LocationsListProps {
  campaignId: number;
  campaignName: string;
  onLocationRemoved?: () => void;
}

interface LocationDetails {
  address: string;
  name?: string;
  location?: string;
  rating?: number;
  isActive?: boolean;
}

export function LocationsList({ campaignId, campaignName, onLocationRemoved }: LocationsListProps) {
  const { wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [removingLocation, setRemovingLocation] = useState<string | null>(null);

  // Get campaign details including locations
  const {
    data: campaignDetails,
    isLoading,
    error,
    refetch,
  } = api.campaigns.getCampaignDetails.useQuery(
    { campaignId },
    { enabled: isOpen }
  );

  const removeLocationMutation = api.campaigns.removeLocation.useMutation({
    onSuccess: () => {
      alert("Location removed successfully!");
      setRemovingLocation(null);
      refetch();
      onLocationRemoved?.();
    },
    onError: (error) => {
      alert(`Failed to remove location: ${error.message}`);
      setRemovingLocation(null);
    },
  });

  const handleRemoveLocation = async (locationAddress: string, deviceId: number) => {
    if (!wallet?.address) {
      alert("Please connect your wallet");
      return;
    }

    if (!confirm("Are you sure you want to remove this location from the campaign?")) {
      return;
    }

    setRemovingLocation(locationAddress);
    try {
      await removeLocationMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        campaignId,
        location: locationAddress,
        deviceId,
      });
    } catch (error) {
      setRemovingLocation(null);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
      >
        <MapPin className="w-4 h-4" />
        View Locations
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Campaign Locations</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Campaign Info */}
          <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-white/50 mb-1">Campaign</p>
                <p className="text-sm font-semibold text-white">{campaignName}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Campaign ID</p>
                <p className="text-sm font-mono text-white">{campaignId}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/60">Loading campaign details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Error Loading Campaign</p>
                <p className="text-xs text-red-400/80">{error.message}</p>
              </div>
            </div>
          ) : !campaignDetails ? (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-white/60 text-center">Campaign not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campaign Stats */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-3">Campaign Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/50">Budget:</span>{" "}
                    <span className="font-medium text-white">{(parseFloat(campaignDetails.budget) / 1e9).toFixed(4)} SOL</span>
                  </div>
                  <div>
                    <span className="text-white/50">Status:</span>{" "}
                    <span className={`font-medium ${campaignDetails.isActive ? 'text-green-400' : 'text-white/60'}`}>
                      {campaignDetails.isActive ? 'Active' : campaignDetails.isPaused ? 'Paused' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Locations List */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Provider Locations</h4>
                {!campaignDetails.locations || campaignDetails.locations.length === 0 ? (
                  <div className="p-4 border border-dashed border-white/20 rounded-xl text-center bg-white/5">
                    <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No locations added to this campaign yet</p>
                    <p className="text-white/40 text-xs mt-1">Use "Add Location" to start adding provider locations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaignDetails.locations.map((locationAddress: string, index: number) => (
                      <LocationItem
                        key={locationAddress}
                        address={locationAddress}
                        deviceId={index + 1}
                        isRemoving={removingLocation === locationAddress}
                        onRemove={(deviceId) => handleRemoveLocation(locationAddress, deviceId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-all bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LocationItemProps {
  address: string;
  deviceId: number;
  isRemoving: boolean;
  onRemove: (deviceId: number) => void;
}

function LocationItem({ address, deviceId, isRemoving, onRemove }: LocationItemProps) {
  const {
    data: providerDetails,
    isLoading,
  } = api.provider.getProviderDetails.useQuery({
    providerAddress: address,
  });

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h5 className="font-medium text-sm font-mono text-white">
              {address.slice(0, 8)}...{address.slice(-8)}
            </h5>
            {isLoading && (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </div>

          {providerDetails && (
            <div className="space-y-1.5 text-xs ml-1">
              <div>
                <span className="text-white/50">Name:</span>{" "}
                <span className="text-white/80">{providerDetails.adProvider.name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-white/50">Location:</span>{" "}
                <span className="text-white/80">{providerDetails.adProvider.location || "Unknown"}</span>
              </div>
              <div>
                <span className="text-white/50">Rating:</span>{" "}
                <span className="text-white/80">{providerDetails.adProvider.rating}/5</span>
              </div>
              <div>
                <span className="text-white/50">Status:</span>{" "}
                <span className={providerDetails.adProvider.isActive ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                  {providerDetails.adProvider.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Device ID:</span>{" "}
                <span className="font-mono text-white/80">{deviceId}</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onRemove(deviceId)}
          disabled={isRemoving}
          className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}