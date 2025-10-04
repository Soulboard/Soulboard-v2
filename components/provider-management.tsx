"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { useProviderOperations } from "@/hooks/useProviderOperations";
import toast, { Toaster } from "react-hot-toast";

export function ProviderManagement() {
  const { wallet } = useWallet();
  const { 
    registerProvider, 
    addDevice, 
    updateProvider, 
    isLoading: providerOperationsLoading 
  } = useProviderOperations();

  const utils = api.useUtils();
  const [activeTab, setActiveTab] = useState<'register' | 'devices' | 'locations' | 'available'>('register');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [step, setStep] = useState(1);

  const [providerForm, setProviderForm] = useState({
    name: '',
    location: '',
    contactEmail: '',
  });

  const [deviceForm, setDeviceForm] = useState({
    deviceId: '',
  });

  const steps = ["Provider Info", "Location", "Contact", "Review"];

  const { data: allProviders, refetch: refetchProviders } = api.provider.getAllProviders.useQuery();
  const { data: registryInfo } = api.provider.getRegistryInfo.useQuery();
  const { data: availableDevices } = api.provider.getAvailableDevices.useQuery();
  const { data: providerDetails } = api.provider.getProviderDetails.useQuery(
    { providerAddress: selectedProvider },
    { enabled: !!selectedProvider }
  );
  const { data: providerDevices } = api.provider.getProviderDevices.useQuery(
    { providerAddress: selectedProvider, includeMetadata: true },
    { enabled: !!selectedProvider }
  );
  const { data: providerLocations } = api.provider.getProviderLocations.useQuery(
    { providerAddress: selectedProvider },
    { enabled: !!selectedProvider }
  );
  const { data: isRegistered } = api.provider.isProviderRegistered.useQuery(
    { providerAddress: wallet?.address || '' },
    { enabled: !!wallet?.address }
  );

  const handleInputChange = (field: keyof typeof providerForm, value: string) => {
    setProviderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegisterProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address) return;

    try {
      const txHash = await registerProvider({
        name: providerForm.name,
        location: providerForm.location,
        contactEmail: providerForm.contactEmail,
      });

      if (txHash) {
        toast.success(`Provider registered successfully! Transaction: ${txHash}`);
        refetchProviders();
        utils.provider.isProviderRegistered.invalidate({ providerAddress: wallet.address });
        setProviderForm({ name: '', location: '', contactEmail: '' });
        setStep(1);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address || !deviceForm.deviceId) return;

    try {
      const txHash = await addDevice({
        deviceId: parseInt(deviceForm.deviceId),
      });

      if (txHash) {
        toast.success(`Device added successfully! Transaction: ${txHash}`);
        setDeviceForm({ deviceId: '' });
        if (selectedProvider) refetchProviders();
      }
    } catch (error) {
      console.error('Add device failed:', error);
      toast.error(`Add device failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (!wallet?.address) {
    return (
      <div className="w-full max-w-4xl mx-auto p-2">
        <Toaster position="top-right" />
        <div className="bg-purple-100/60 backdrop-blur-sm border border-purple-200 shadow-lg rounded-3xl p-6">
          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl shadow-inner p-8">
            <h2 className="text-lg font-medium mb-3">Provider Management</h2>
            <p className="text-gray-500">Please connect your wallet to manage providers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2">
      <Toaster position="top-right" />
      <div className="bg-purple-100/60 backdrop-blur-sm border border-purple-200 shadow-lg rounded-3xl p-6">
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl shadow-inner p-8">

          {/* Wallet & Registry Cards */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Your Wallet</h3>
              <p className="text-sm font-mono bg-white px-2 py-1 rounded border border-purple-200">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
              </p>
              <span className={`px-3 py-1 mt-2 inline-block rounded-full text-xs font-semibold ${
                isRegistered?.isRegistered
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}>
                {isRegistered?.isRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>

            {registryInfo && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Registry Info</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <p className="text-2xl font-bold">{registryInfo.totalProviders}</p>
                    <p className="text-xs text-gray-600">Providers</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <p className="text-2xl font-bold">{registryInfo.keepers.length}</p>
                    <p className="text-xs text-gray-600">Keepers</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Deployer</p>
                    <code className="text-[10px] font-mono text-gray-700">{registryInfo.deployer.slice(0, 4)}...{registryInfo.deployer.slice(-4)}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {['register', 'devices', 'locations', 'available'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {isRegistered?.isRegistered ? (
                <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-lg text-base">
                  You are already registered.
                </div>
              ) : (
                <form onSubmit={handleRegisterProvider} className="space-y-4">
                  {step === 1 && <input placeholder="Provider Name" className="input-field" value={providerForm.name} onChange={(e) => handleInputChange("name", e.target.value)} />}
                  {step === 2 && <input placeholder="Location" className="input-field" value={providerForm.location} onChange={(e) => handleInputChange("location", e.target.value)} />}
                  {step === 3 && <input placeholder="Contact Email" type="email" className="input-field" value={providerForm.contactEmail} onChange={(e) => handleInputChange("contactEmail", e.target.value)} />}
                  {step === 4 && (
                    <div className="bg-gray-50 border rounded-lg p-6 text-base space-y-2">
                      <p><strong>Name:</strong> {providerForm.name}</p>
                      <p><strong>Location:</strong> {providerForm.location}</p>
                      <p><strong>Email:</strong> {providerForm.contactEmail}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    {step > 1 && <button type="button" onClick={() => setStep(step-1)} className="btn-back">Back</button>}
                    {step < steps.length && <button type="button" onClick={() => setStep(step+1)} className="btn-next">Next</button>}
                    {step === steps.length && (
                      <button type="submit" disabled={providerOperationsLoading || !wallet} className="btn-submit">
                        {providerOperationsLoading ? "Registering..." : "Register Provider"}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Devices, Locations, Available Tabs */}
          {activeTab === 'devices' && <div>Device management content...</div>}
          {activeTab === 'locations' && <div>Provider locations content...</div>}
          {activeTab === 'available' && <div>Available devices content...</div>}
        </div>
      </div>
    </div>
  );
}
