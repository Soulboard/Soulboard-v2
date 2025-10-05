"use client";

import { useState } from "react";
import { useContractOperations, type AddBudgetInput } from "@/hooks/useContractOperations";
import { api } from "@/trpc/react";
import { Plus, X, DollarSign, AlertCircle } from "lucide-react";

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
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
        disabled={!wallet}
      >
        <Plus className="w-4 h-4" />
        Add Budget
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Add Budget to Campaign
              </h3>
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

          {/* Wallet Warning */}
          {!wallet && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-400 mb-1">Wallet Required</p>
                <p className="text-xs text-yellow-400/80">Please connect your wallet to add budget.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-white mb-2">
                Amount (SOL) *
              </label>
              <input
                type="number"
                id="amount"
                step="0.001"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                required
                min="0.001"
                placeholder="Enter amount in SOL"
              />
              <p className="mt-1.5 text-xs text-white/50">
                Minimum: 0.001 SOL
              </p>
            </div>

            {/* Error Message */}
            {addBudgetState.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">Error</p>
                  <p className="text-xs text-red-400/80">{addBudgetState.error.message}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {addBudgetState.data && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-400 mb-1">Budget Added Successfully!</p>
                  <p className="text-xs text-green-400/80 font-mono">{addBudgetState.data.message}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !wallet || formData.amount <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                  isLoading || !wallet || formData.amount <= 0
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-black rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Add Budget
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}