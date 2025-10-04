"use client";

import { useState } from "react";
import { MapPin, Info, X, CheckCircle, XCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { api } from "@/trpc/react";

export default function LocationsPage() {
  const [selected, setSelected] = useState<any>(null);

  // Fetch all providers/locations from API
  const { data: providersData, isLoading, error } = api.provider.getAllProviders.useQuery();
  const providers = providersData?.providers || [];

  const getCardStyles = (available: boolean) => {
    if (available) {
      return {
        bg: "bg-green-50",
        border: "border-green-300",
        headerBg: "bg-green-100",
        headerText: "text-green-800",
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        primaryBtn: "bg-[#223241] hover:bg-[#1a2631]",
      };
    } else {
      return {
        bg: "bg-blue-50",
        border: "border-blue-300",
        headerBg: "bg-blue-100",
        headerText: "text-blue-800",
        icon: <XCircle className="w-6 h-6 text-blue-600" />,
        primaryBtn: "bg-[#223241] hover:bg-[#1a2631]",
      };
    }
  };

  const handleMoreDetails = (provider: any) => {
    setSelected(provider);
    toast(`Viewing details for ${provider.adProvider?.name || 'location'}`);
  };

  const handleBookNow = (provider: any) => {
    // TODO: Implement actual booking logic with campaign selection
    // This should open a modal to select which campaign to add this location to
    // Then call api.campaigns.addLocation.useMutation()
    toast.success(`Booking request for ${provider.adProvider?.name || 'location'} initiated!`);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Toaster */}
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

      {/* Gradient Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto -mt-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Advertising 
            <br />
            <span className="relative inline-block">
              Locations
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-purple-200/50 -rotate-1"></div>
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Browse provider-owned locations and book with one click
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading available locations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">Failed to load locations: {error.message}</p>
          </div>
        )}

        {/* Grid of Location Cards */}
        {!isLoading && !error && providers && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider: any) => {
              const adProvider = provider.adProvider || {};
              const styles = getCardStyles(adProvider.isActive ?? true);
              
              return (
                <div
                  key={provider.address}
                  className={`${styles.bg} ${styles.border} border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all`}
                >
                  {/* Header */}
                  <div className={`${styles.headerBg} px-4 py-3 border-b ${styles.border}`}>
                    <span className={`text-sm font-medium ${styles.headerText}`}>
                      {adProvider.isActive ? 'Available Location' : 'Currently Booked'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0">{styles.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {adProvider.name || 'Unknown Location'}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                          {adProvider.description || 'High visibility location, ideal for brand campaigns.'}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Provider:</span> {provider.address?.slice(0, 8)}...{provider.address?.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Location:</span> {adProvider.location || 'Not specified'}
                        </p>
                        {adProvider.rating && (
                          <p className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Rating:</span> {adProvider.rating}/5 ⭐
                          </p>
                        )}
                        <p className="text-xl font-extrabold text-gray-900">
                          {adProvider.pricePerDay || 'Contact for pricing'}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={() => handleMoreDetails(provider)}
                        className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors ${styles.primaryBtn}`}
                      >
                        More Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && providers && providers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No locations available at the moment</p>
            <p className="text-gray-400">Check back later for new advertising locations</p>
          </div>
        )}
      </div>

      {/* Expanded Card (Modal) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Info className="w-6 h-6 text-[#223241]" />
              <h2 className="text-2xl font-bold">
                {selected.adProvider?.name || 'Location Details'}
              </h2>
            </div>

            <div className="space-y-3 text-gray-700">
              <p><span className="font-medium">Provider:</span> {selected.address}</p>
              <p><span className="font-medium">Location:</span> {selected.adProvider?.location || 'Not specified'}</p>
              <p><span className="font-medium">Details:</span> {selected.adProvider?.description || 'High visibility location'}</p>
              {selected.adProvider?.rating && (
                <p><span className="font-medium">Rating:</span> {selected.adProvider.rating}/5 ⭐</p>
              )}
              <p className="text-gray-700 font-semibold">
                {selected.adProvider?.pricePerDay || 'Contact for pricing'}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              {selected.adProvider?.isActive && (
                <button
                  onClick={() => handleBookNow(selected)}
                  className="px-5 py-2 rounded-lg bg-[#223241] text-white hover:bg-[#1a2631] font-medium"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}