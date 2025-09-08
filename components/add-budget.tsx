"use client";

import { useState } from "react";
import { useContractOperations, type AddBudgetInput } from "@/hooks/useContractOperations";
import { api } from "@/trpc/react";

interface AddBudgetFormProps {
  campaignId: number;
  campaignName: string;
  onSuccess?: () => void;
}

export function AddBudgetForm({ campaignId, campaignName, onSuccess }: AddBudgetFormProps) {
  const { addBudget, addBudgetState, isLoading, wallet } = useContractOperations();
  const utils = api.useUtils();
  
  const [formData, setFormData] = useState<AddBudgetInput>({
    campaignId,
    amount: 0.1, // Default 0.1 SOL
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    if (formData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const txHash = await addBudget(formData);
      if (txHash) {
        alert(`Budget added successfully! Transaction: ${txHash}`);
        
        // Invalidate campaigns query to refresh the list
        if (wallet.address) {
          utils.contracts.getUserCampaigns.invalidate({ userAddress: wallet.address });
        }
        
        // Reset form and close modal
        setFormData({
          campaignId,
          amount: 0.1,
        });
        setIsOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Add budget failed:", error);
      alert(`Add budget failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleInputChange = (field: keyof AddBudgetInput, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={!wallet}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Budget
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Add Budget to Campaign
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Campaign:</span> {campaignName}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">ID:</span> {campaignId}
            </p>
          </div>

          {!wallet && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              Please connect your wallet to add budget.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (SOL)
              </label>
              <input
                type="number"
                id="amount"
                step="0.001"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                min="0.001"
                placeholder="Enter amount in SOL"
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum: 0.001 SOL
              </p>
            </div>

            {addBudgetState.error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {addBudgetState.error.message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading || !wallet || formData.amount <= 0}
                className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || !wallet || formData.amount <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {isLoading ? "Adding Budget..." : "Add Budget"}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>

          {addBudgetState.data && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-medium">Budget Added Successfully!</p>
              <p className="text-sm">Transaction: {addBudgetState.data.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
