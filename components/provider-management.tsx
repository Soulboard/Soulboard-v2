"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { useProviderOperations } from "@/hooks/useProviderOperations";

export function ProviderManagement() {
  const { wallet } = useWallet();
  const { 
    registerProvider, 
    addDevice, 
    updateProvider, 
    isLoading: providerOperationsLoading 
  } = useProviderOperations();
  
  const [activeTab, setActiveTab] = useState<'register' | 'devices' | 'locations' | 'available'>('register');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  // Form states
  const [providerForm, setProviderForm] = useState({
    name: '',
    location: '',
    contactEmail: '',
  });
  
  const [deviceForm, setDeviceForm] = useState({
    deviceId: '',
  });

  // Queries
  const { data: allProviders, refetch: refetchProviders } = api.provider.getAllProviders.useQuery();
  const { data: registryInfo } = api.provider.getRegistryInfo.useQuery();
  const { data: availableDevices } = api.provider.getAvailableDevices.useQuery();
  
  // Provider details query (only when a provider is selected)
  const { data: providerDetails } = api.provider.getProviderDetails.useQuery(
    { providerAddress: selectedProvider },
    { enabled: !!selectedProvider }
  );
  
  // Provider devices query (only when a provider is selected)
  const { data: providerDevices } = api.provider.getProviderDevices.useQuery(
    { providerAddress: selectedProvider, includeMetadata: true },
    { enabled: !!selectedProvider }
  );
  
  // Provider locations query (only when a provider is selected)
  const { data: providerLocations } = api.provider.getProviderLocations.useQuery(
    { providerAddress: selectedProvider },
    { enabled: !!selectedProvider }
  );

  // Check if current wallet is registered
  const { data: isRegistered } = api.provider.isProviderRegistered.useQuery(
    { providerAddress: wallet?.address || '' },
    { enabled: !!wallet?.address }
  );

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
        alert(`Provider registered successfully! Transaction: ${txHash}`);
        refetchProviders();
        setProviderForm({ name: '', location: '', contactEmail: '' });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        alert(`Device added successfully! Transaction: ${txHash}`);
        setDeviceForm({ deviceId: '' });
        // Refetch provider data if a provider is selected
        if (selectedProvider) {
          refetchProviders();
        }
      }
    } catch (error) {
      console.error('Add device failed:', error);
      alert(`Add device failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (!wallet?.address) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-lg font-medium mb-3">Provider Management</h2>
        <p className="text-gray-500">Please connect your wallet to manage providers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h2 className="text-lg font-medium mb-4">Provider Management</h2>
      
      {/* Wallet Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Wallet:</span> {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
        </p>
        <p className="text-sm">
          <span className="font-medium">Registered:</span> {isRegistered?.isRegistered ? 'Yes' : 'No'}
        </p>
      </div>

      {/* Registry Info */}
      {registryInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Registry Information</h3>
          <p className="text-xs">Total Providers: {registryInfo.totalProviders}</p>
          <p className="text-xs">Deployer: {registryInfo.deployer.slice(0, 8)}...{registryInfo.deployer.slice(-8)}</p>
          <p className="text-xs">Keepers: {registryInfo.keepers.length}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'register', label: 'Register' },
          { id: 'devices', label: 'Devices' },
          { id: 'locations', label: 'Locations' },
          { id: 'available', label: 'Available' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <h3 className="font-medium">Register as Provider</h3>
          {isRegistered?.isRegistered ? (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">You are already registered as a provider!</p>
            </div>
          ) : (
            <form onSubmit={handleRegisterProvider} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Provider Name</label>
                <input
                  type="text"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., Digital Displays Inc"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={providerForm.location}
                  onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  value={providerForm.contactEmail}
                  onChange={(e) => setProviderForm({ ...providerForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="contact@company.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={providerOperationsLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {providerOperationsLoading ? 'Registering Provider...' : 'Register Provider'}
              </button>
            </form>
          )}

          {/* Add Device Form (for registered providers) */}
          {isRegistered?.isRegistered && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Add Device</h4>
              <form onSubmit={handleAddDevice} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Device ID</label>
                  <input
                    type="number"
                    value={deviceForm.deviceId}
                    onChange={(e) => setDeviceForm({ ...deviceForm, deviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., 123"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={providerOperationsLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {providerOperationsLoading ? 'Adding Device...' : 'Add Device'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select a provider</option>
              {allProviders?.providers.map((provider: string) => (
                <option key={provider} value={provider}>
                  {provider.slice(0, 8)}...{provider.slice(-8)}
                </option>
              ))}
            </select>
          </div>

          {providerDevices && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium">Total Devices</p>
                  <p className="text-lg font-bold">{providerDevices.summary.totalDevices}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium">Available</p>
                  <p className="text-lg font-bold text-green-600">{providerDevices.summary.availableDevices}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium">Booked</p>
                  <p className="text-lg font-bold text-blue-600">{providerDevices.summary.bookedDevices}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs font-medium">Paused</p>
                  <p className="text-lg font-bold text-red-600">{providerDevices.summary.pausedDevices}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Device List</h4>
                {providerDevices.devices.map((device) => (
                  <div key={device.deviceId} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Device #{device.deviceId}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.deviceState === 'available' ? 'bg-green-100 text-green-800' :
                        device.deviceState === 'booked' ? 'bg-blue-100 text-blue-800' :
                        device.deviceState === 'paused' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {device.deviceState}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{device.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select a provider</option>
              {allProviders?.providers.map((provider: string) => (
                <option key={provider} value={provider}>
                  {provider.slice(0, 8)}...{provider.slice(-8)}
                </option>
              ))}
            </select>
          </div>

          {providerLocations && (
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Primary Location</h4>
                <p className="text-sm"><span className="font-medium">Name:</span> {providerLocations.locations.primaryLocation.name}</p>
                <p className="text-sm"><span className="font-medium">Address:</span> {providerLocations.locations.primaryLocation.address}</p>
                <p className="text-sm"><span className="font-medium">Contact:</span> {providerLocations.locations.primaryLocation.contactEmail}</p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Device Locations</h4>
                {providerLocations.locations.deviceLocations.map((device) => (
                  <div key={device.deviceId} className="py-2 border-b last:border-b-0">
                    <p className="text-sm"><span className="font-medium">Device #{device.deviceId}:</span> {device.location}</p>
                    <p className="text-xs text-gray-600">Status: {device.deviceState}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-4">
          <h3 className="font-medium">All Available Devices</h3>
          {availableDevices && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">{availableDevices.totalAvailableDevices}</span> devices available 
                  from <span className="font-medium">{availableDevices.summary.providersWithAvailableDevices}</span> providers
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableDevices.availableDevices.map((device) => (
                  <div key={`${device.providerAddress}-${device.deviceId}`} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Device #{device.deviceId}</p>
                        <p className="text-sm text-gray-600">{device.providerName}</p>
                        <p className="text-sm text-gray-600">{device.location}</p>
                        <p className="text-xs text-gray-500">{device.contactEmail}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">Rating:</span>
                          <span className="text-sm font-medium">{device.providerRating}/10</span>
                        </div>
                        <p className="text-xs text-gray-500">{device.providerAddress.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
