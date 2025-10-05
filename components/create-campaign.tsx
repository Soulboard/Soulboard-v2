// components/create-campaign.tsx
"use client";

import { useState } from "react";
import { useContractOperations, type CreateCampaignInput } from "@/hooks/useContractOperations";
import { api } from "@/trpc/react";
import { toast, Toaster } from "react-hot-toast";
import { Check, AlertCircle } from "lucide-react";

export function CreateCampaignForm() {
  const { createCampaign, createCampaignState, isLoading, wallet } = useContractOperations();
  const utils = api.useUtils();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<CreateCampaignInput>({
    campaignId: 0,
    campaignName: "",
    campaignDescription: "",
    runningDays: 0,
    hoursPerDay: 0,
    baseFeePerHour: 0.001,
    initialBudget: 0,
  });

  const steps = ["Basics", "Details", "Duration", "Budget", "Review"];

  const handleInputChange = (field: keyof CreateCampaignInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const txHash = await createCampaign(formData);
      if (txHash) {
        toast.success(`Campaign created successfully! Transaction: ${txHash}`);

        if (wallet.address) {
          utils.contracts.getUserCampaigns.invalidate({ userAddress: wallet.address });
        }

        setFormData({
          campaignId: formData.campaignId + 1,
          campaignName: "",
          campaignDescription: "",
          runningDays: 7,
          hoursPerDay: 8,
          baseFeePerHour: 0.001,
          initialBudget: 0,
        });
        setStep(1);
      }
    } catch (error) {
      console.error("Campaign creation failed:", error);
      toast.error(
        `Campaign creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            borderRadius: "12px",
            padding: "12px 16px",
            background: "#18181b",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Main Form Container */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
        
        {!wallet && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Please connect your wallet to create a campaign.</span>
          </div>
        )}

        {/* Step Progress */}
        <div className="mb-10 flex justify-between items-center relative">
          {steps.map((s, i) => {
            const isCompleted = step > i + 1;
            const isCurrent = step === i + 1;
            return (
              <div key={i} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all ${
                    isCompleted
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 border-purple-400 text-white"
                      : isCurrent
                      ? "bg-white/10 border-white text-white"
                      : "bg-white/5 border-white/20 text-white/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                </div>

                <span
                  className={`ml-2 text-xs md:text-sm font-medium ${
                    isCompleted || isCurrent ? "text-white" : "text-white/40"
                  }`}
                >
                  {s}
                </span>

                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      step > i + 1 ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Campaign ID
                </label>
                <input
                  type="number"
                  value={formData.campaignId}
                  onChange={(e) => handleInputChange("campaignId", parseInt(e.target.value))}
                  min="1"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="Enter campaign ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => handleInputChange("campaignName", e.target.value)}
                  maxLength={100}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="Enter campaign name"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Campaign Description
              </label>
              <textarea
                value={formData.campaignDescription}
                onChange={(e) => handleInputChange("campaignDescription", e.target.value)}
                rows={5}
                maxLength={500}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none"
                placeholder="Describe your campaign..."
              />
              <p className="text-xs text-white/50 mt-2">
                {formData.campaignDescription.length}/500 characters
              </p>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Running Days
                </label>
                <input
                  type="number"
                  value={formData.runningDays}
                  onChange={(e) => handleInputChange("runningDays", parseInt(e.target.value))}
                  min="1"
                  max="365"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="1-365 days"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Hours Per Day
                </label>
                <input
                  type="number"
                  value={formData.hoursPerDay}
                  onChange={(e) => handleInputChange("hoursPerDay", parseInt(e.target.value))}
                  min="1"
                  max="24"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="1-24 hours"
                />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Base Fee Per Hour (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formData.baseFeePerHour}
                  onChange={(e) =>
                    handleInputChange("baseFeePerHour", parseFloat(e.target.value))
                  }
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="0.001"
                />
                <p className="text-xs text-white/50 mt-2">
                  Total base cost:{" "}
                  <span className="text-purple-400 font-semibold">
                    {(
                      formData.runningDays *
                      formData.hoursPerDay *
                      formData.baseFeePerHour
                    ).toFixed(3)}{" "}
                    SOL
                  </span>{" "}
                  per device
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Initial Budget (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.initialBudget}
                  onChange={(e) =>
                    handleInputChange("initialBudget", parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="0.000"
                />
              </div>
            </div>
          )}

          {/* Step 5 - Review */}
          {step === 5 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Campaign Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Campaign ID</p>
                  <p className="text-white font-semibold">{formData.campaignId}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Campaign Name</p>
                  <p className="text-white font-semibold">{formData.campaignName}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-white/50 mb-1">Description</p>
                  <p className="text-white">{formData.campaignDescription}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Duration</p>
                  <p className="text-white font-semibold">
                    {formData.runningDays} days, {formData.hoursPerDay} hrs/day
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Base Fee</p>
                  <p className="text-white font-semibold">{formData.baseFeePerHour} SOL/hr</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Initial Budget</p>
                  <p className="text-purple-400 font-bold text-lg">{formData.initialBudget} SOL</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-sm font-semibold rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            {step < steps.length && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-3 text-sm font-semibold rounded-xl bg-white text-black hover:bg-white/90 transition-all"
              >
                Next
              </button>
            )}
            {step === steps.length && (
              <button
                type="submit"
                disabled={isLoading || !wallet}
                className={`ml-auto px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                  isLoading || !wallet
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {isLoading ? "Creating..." : "Create Campaign"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}