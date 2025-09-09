"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useWallet } from "@crossmint/client-sdk-react-ui";

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
        className="h-7 px-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        View Locations
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Campaign Locations</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Locations for "{campaignName}" campaign
        </p>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading campaign details...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">Error loading campaign: {error.message}</p>
          </div>
        ) : !campaignDetails ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-600">Campaign not found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Campaign Info */}
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Campaign Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Budget:</span>{" "}
                  <span className="font-medium">{(parseFloat(campaignDetails.budget) / 1e9).toFixed(4)} SOL</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className={`font-medium ${campaignDetails.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {campaignDetails.isActive ? 'Active' : campaignDetails.isPaused ? 'Paused' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Locations List */}
            <div>
              <h4 className="font-medium mb-3">Provider Locations</h4>
              {!campaignDetails.locations || campaignDetails.locations.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                  <p className="text-gray-600">No locations added to this campaign yet</p>
                  <p className="text-sm text-gray-500 mt-1">Use "Add Location" to start adding provider locations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaignDetails.locations.map((locationAddress: string, index: number) => (
                    <LocationItem
                      key={locationAddress}
                      address={locationAddress}
                      deviceId={index + 1} // Simple device ID assignment
                      isRemoving={removingLocation === locationAddress}
                      onRemove={(deviceId) => handleRemoveLocation(locationAddress, deviceId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
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
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-medium text-sm">
              {address.slice(0, 8)}...{address.slice(-8)}
            </h5>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {providerDetails && (
            <div className="space-y-1 text-xs text-gray-600">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span>{providerDetails.adProvider.name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>{" "}
                <span>{providerDetails.adProvider.location || "Unknown"}</span>
              </div>
              <div>
                <span className="text-gray-500">Rating:</span>{" "}
                <span>{providerDetails.adProvider.rating}/5</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className={providerDetails.adProvider.isActive ? "text-green-600" : "text-red-600"}>
                  {providerDetails.adProvider.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Device ID:</span>{" "}
                <span className="font-mono">{deviceId}</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onRemove(deviceId)}
          disabled={isRemoving}
          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
