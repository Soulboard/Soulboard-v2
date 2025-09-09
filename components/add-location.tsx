"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";

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
        className="h-7 px-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        + Add Location
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Location to Campaign</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Add a new provider location to "{campaignName}" campaign
        </p>

        {/* Existing Locations Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Locations in Campaign</h4>
          {isLoadingCampaign ? (
            <div className="p-3 border rounded-md text-center text-gray-500">
              Loading current locations...
            </div>
          ) : !campaignDetails ? (
            <div className="p-3 border rounded-md bg-red-50 text-red-600 text-sm">
              Unable to load campaign details
            </div>
          ) : !campaignDetails.locations || campaignDetails.locations.length === 0 ? (
            <div className="p-3 border border-dashed border-gray-300 rounded-md text-center">
              <p className="text-gray-500 text-sm">No locations added to this campaign yet</p>
              <p className="text-gray-400 text-xs mt-1">Add your first location below</p>
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

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Location</h4>

          <div className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Provider Location
              </label>
              {isLoadingProviders ? (
                <div className="p-3 border rounded-md text-center text-gray-500">
                  Loading providers...
                </div>
              ) : providersError ? (
                <div className="p-3 border rounded-md bg-red-50 text-red-600 text-sm">
                  Error loading providers: {providersError.message}
                </div>
              ) : providers.length === 0 ? (
                <div className="p-3 border rounded-md bg-gray-50 text-gray-600 text-sm">
                  No providers available. Register providers first.
                </div>
              ) : (
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a provider location</option>
                  {providers.map((providerAddress: string) => (
                    <option key={providerAddress} value={providerAddress}>
                      {providerAddress.slice(0, 8)}...{providerAddress.slice(-8)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Provider Details */}
            {selectedProvider && (
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium mb-2">Provider Details</h4>
                {isLoadingDetails ? (
                  <div className="text-sm text-gray-500">Loading details...</div>
                ) : providerDetails ? (
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className={providerDetails.adProvider.isActive ? "text-green-600" : "text-red-600"}>
                        {providerDetails.adProvider.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
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
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Failed to load provider details
                  </div>
                )}
              </div>
            )}

            {/* Device ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <input
                type="number"
                placeholder="Enter device ID (e.g., 1)"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for the device at this location
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Location"}
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
    <div className="p-2 bg-gray-50 rounded border">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              #{index}
            </span>
            <span className="text-sm font-mono">
              {address.slice(0, 8)}...{address.slice(-8)}
            </span>
            {isLoading && (
              <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {providerDetails && (
            <div className="mt-1 space-y-0.5">
              <div className="text-xs text-gray-600">
                <span className="text-gray-500">Name:</span> {providerDetails.adProvider.name || "Unknown"}
              </div>
              <div className="text-xs text-gray-600">
                <span className="text-gray-500">Location:</span> {providerDetails.adProvider.location || "Unknown"}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded ${
            providerDetails?.adProvider.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {providerDetails?.adProvider.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>
    </div>
  );
}
