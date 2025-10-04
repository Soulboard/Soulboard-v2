"use client";

import { useState } from "react";
import { useContractOperations, type CreateCampaignInput } from "@/hooks/useContractOperations";
import { api } from "@/trpc/react";
import { toast, Toaster } from "react-hot-toast";

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
    <div className="w-full max-w-4xl mx-auto p-2">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            borderRadius: "12px",
            padding: "12px 16px",
            background: "#f3f4f6",
            color: "#111827",
          },
        }}
      />

      {/* Outer shield */}
      <div className="bg-purple-100/60 backdrop-blur-sm border border-purple-200 shadow-lg rounded-3xl p-6">
        {/* Inner shield */}
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl shadow-inner p-8">
          
          {!wallet && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-base">
              Please connect your wallet to create a campaign.
            </div>
          )}

          {/* Circular Step Progress */}
          <div className="mb-8 flex justify-between items-center relative">
            {steps.map((s, i) => {
              const isCompleted = step > i + 1;
              const isCurrent = step === i + 1;
              return (
                <div key={i} className="flex-1 flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all ${
                      isCompleted
                        ? "bg-[#223241] border-[#223241] text-white"
                        : isCurrent
                        ? "bg-white border-[#223241] text-[#223241]"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>

                  <span
                    className={`ml-2 text-xs md:text-sm font-medium ${
                      isCompleted || isCurrent ? "text-[#223241]" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>

                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step > i + 1 ? "bg-[#223241]" : "bg-gray-300"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Campaign ID
                  </label>
                  <input
                    type="number"
                    value={formData.campaignId}
                    onChange={(e) => handleInputChange("campaignId", parseInt(e.target.value))}
                    min="1"
                    required
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) => handleInputChange("campaignName", e.target.value)}
                    maxLength={100}
                    required
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Campaign Description
                </label>
                <textarea
                  value={formData.campaignDescription}
                  onChange={(e) => handleInputChange("campaignDescription", e.target.value)}
                  rows={5}
                  maxLength={500}
                  required
                  className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                />
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Running Days
                  </label>
                  <input
                    type="number"
                    value={formData.runningDays}
                    onChange={(e) => handleInputChange("runningDays", parseInt(e.target.value))}
                    min="1"
                    max="365"
                    required
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Hours Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.hoursPerDay}
                    onChange={(e) => handleInputChange("hoursPerDay", parseInt(e.target.value))}
                    min="1"
                    max="24"
                    required
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
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
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Total base cost:{" "}
                    {(
                      formData.runningDays *
                      formData.hoursPerDay *
                      formData.baseFeePerHour
                    ).toFixed(3)}{" "}
                    SOL per device
                  </p>
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
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
                    className="w-full border rounded-lg px-4 py-3 text-base shadow-sm focus:ring-2 focus:ring-[#223241]"
                  />
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="bg-gray-50 border rounded-lg p-6 text-base space-y-2">
                <p><strong>ID:</strong> {formData.campaignId}</p>
                <p><strong>Name:</strong> {formData.campaignName}</p>
                <p><strong>Description:</strong> {formData.campaignDescription}</p>
                <p><strong>Duration:</strong> {formData.runningDays} days, {formData.hoursPerDay} hrs/day</p>
                <p><strong>Base Fee:</strong> {formData.baseFeePerHour} SOL/hr</p>
                <p><strong>Budget:</strong> {formData.initialBudget} SOL</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-base rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200"
                >
                  Back
                </button>
              )}
              {step < steps.length && (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-6 py-3 text-base rounded-lg bg-[#223241] text-white hover:bg-[#1a2631]"
                >
                  Next
                </button>
              )}
              {step === steps.length && (
                <button
                  type="submit"
                  disabled={isLoading || !wallet}
                  className={`ml-auto px-6 py-3 text-base rounded-lg ${
                    isLoading || !wallet
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isLoading ? "Creating..." : "Create Campaign"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
