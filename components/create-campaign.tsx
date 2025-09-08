"use client";

import { useState } from "react";
import { useContractOperations, type CreateCampaignInput } from "@/hooks/useContractOperations";
import { api } from "@/trpc/react";

export function CreateCampaignForm() {
  const { createCampaign, createCampaignState, isLoading, wallet } = useContractOperations();
  const utils = api.useUtils();
  
  const [formData, setFormData] = useState<CreateCampaignInput>({
    campaignId: 1,
    campaignName: "",
    campaignDescription: "",
    runningDays: 7,
    hoursPerDay: 8,
    baseFeePerHour: 0.001, // 0.001 SOL per hour
    initialBudget: 0, // Initial budget in SOL
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const txHash = await createCampaign(formData);
      if (txHash) {
        alert(`Campaign created successfully! Transaction: ${txHash}`);
        
        // Invalidate campaigns query to refresh the list
        if (wallet.address) {
          utils.contracts.getUserCampaigns.invalidate({ userAddress: wallet.address });
        }
        
        // Reset form or redirect
        setFormData({
          campaignId: formData.campaignId + 1, // Increment for next campaign
          campaignName: "",
          campaignDescription: "",
          runningDays: 7,
          hoursPerDay: 8,
          baseFeePerHour: 0.001,
          initialBudget: 0,
        });
      }
    } catch (error) {
      console.error("Campaign creation failed:", error);
      alert(`Campaign creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleInputChange = (field: keyof CreateCampaignInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Campaign</h2>
      
      {!wallet && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Please connect your wallet to create a campaign.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="campaignId" className="block text-sm font-medium text-gray-700">
            Campaign ID
          </label>
          <input
            type="number"
            id="campaignId"
            value={formData.campaignId}
            onChange={(e) => handleInputChange("campaignId", parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
          />
          <p className="mt-1 text-sm text-gray-500">Unique identifier for your campaign</p>
        </div>

        <div>
          <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
            Campaign Name
          </label>
          <input
            type="text"
            id="campaignName"
            value={formData.campaignName}
            onChange={(e) => handleInputChange("campaignName", e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={100}
            placeholder="Enter campaign name"
          />
        </div>

        <div>
          <label htmlFor="campaignDescription" className="block text-sm font-medium text-gray-700">
            Campaign Description
          </label>
          <textarea
            id="campaignDescription"
            value={formData.campaignDescription}
            onChange={(e) => handleInputChange("campaignDescription", e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={500}
            placeholder="Describe your campaign"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="runningDays" className="block text-sm font-medium text-gray-700">
              Running Days
            </label>
            <input
              type="number"
              id="runningDays"
              value={formData.runningDays}
              onChange={(e) => handleInputChange("runningDays", parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              max="365"
            />
          </div>

          <div>
            <label htmlFor="hoursPerDay" className="block text-sm font-medium text-gray-700">
              Hours Per Day
            </label>
            <input
              type="number"
              id="hoursPerDay"
              value={formData.hoursPerDay}
              onChange={(e) => handleInputChange("hoursPerDay", parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              max="24"
            />
          </div>
        </div>

        <div>
          <label htmlFor="baseFeePerHour" className="block text-sm font-medium text-gray-700">
            Base Fee Per Hour (SOL)
          </label>
          <input
            type="number"
            id="baseFeePerHour"
            step="0.001"
            value={formData.baseFeePerHour}
            onChange={(e) => handleInputChange("baseFeePerHour", parseFloat(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            min="0.001"
          />
          <p className="mt-1 text-sm text-gray-500">
            Total base cost: {(formData.runningDays * formData.hoursPerDay * formData.baseFeePerHour).toFixed(3)} SOL per device
          </p>
        </div>

        <div>
          <label htmlFor="initialBudget" className="block text-sm font-medium text-gray-700">
            Initial Budget (SOL)
          </label>
          <input
            type="number"
            id="initialBudget"
            step="0.001"
            value={formData.initialBudget}
            onChange={(e) => handleInputChange("initialBudget", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional: Add initial budget to the campaign (you can add more later)
          </p>
        </div>

        {createCampaignState.error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {createCampaignState.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !wallet}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading || !wallet
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
        >
          {isLoading ? "Creating Campaign..." : "Create Campaign"}
        </button>
      </form>

      {createCampaignState.data && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">Campaign Creation Details:</p>
          <p>Campaign PDA: {createCampaignState.data.campaignPDA}</p>
          <p>Message: {createCampaignState.data.message}</p>
        </div>
      )}
    </div>
  );
}
