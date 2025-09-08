"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function ProviderTestingPanel() {
  const [testAddress, setTestAddress] = useState<string>('');
  const [activeTest, setActiveTest] = useState<string>('');

  // Query hooks - these will automatically execute when enabled
  const { data: allProviders, isLoading: loadingProviders, error: errorProviders } = 
    api.provider.getAllProviders.useQuery(undefined, { enabled: activeTest === 'getAllProviders' });
  
  const { data: registryInfo, isLoading: loadingRegistry, error: errorRegistry } = 
    api.provider.getRegistryInfo.useQuery(undefined, { enabled: activeTest === 'getRegistryInfo' });
  
  const { data: availableDevices, isLoading: loadingAvailable, error: errorAvailable } = 
    api.provider.getAvailableDevices.useQuery(undefined, { enabled: activeTest === 'getAvailableDevices' });
  
  const { data: isRegistered, isLoading: loadingRegistered, error: errorRegistered } = 
    api.provider.isProviderRegistered.useQuery(
      { providerAddress: testAddress }, 
      { enabled: activeTest === 'isProviderRegistered' && !!testAddress }
    );
  
  const { data: providerDetails, isLoading: loadingDetails, error: errorDetails } = 
    api.provider.getProviderDetails.useQuery(
      { providerAddress: testAddress }, 
      { enabled: activeTest === 'getProviderDetails' && !!testAddress }
    );
  
  const { data: providerDevices, isLoading: loadingDevices, error: errorDevices } = 
    api.provider.getProviderDevices.useQuery(
      { providerAddress: testAddress, includeMetadata: true }, 
      { enabled: activeTest === 'getProviderDevices' && !!testAddress }
    );
  
  const { data: providerLocations, isLoading: loadingLocations, error: errorLocations } = 
    api.provider.getProviderLocations.useQuery(
      { providerAddress: testAddress }, 
      { enabled: activeTest === 'getProviderLocations' && !!testAddress }
    );

  const testEndpoint = (endpoint: string) => {
    if (!testAddress && endpoint !== 'getAllProviders' && endpoint !== 'getRegistryInfo' && endpoint !== 'getAvailableDevices') {
      alert('Please enter a provider address first');
      return;
    }
    setActiveTest(endpoint);
  };

  const getCurrentData = () => {
    switch (activeTest) {
      case 'getAllProviders':
        return { data: allProviders, loading: loadingProviders, error: errorProviders };
      case 'getRegistryInfo':
        return { data: registryInfo, loading: loadingRegistry, error: errorRegistry };
      case 'getAvailableDevices':
        return { data: availableDevices, loading: loadingAvailable, error: errorAvailable };
      case 'isProviderRegistered':
        return { data: isRegistered, loading: loadingRegistered, error: errorRegistered };
      case 'getProviderDetails':
        return { data: providerDetails, loading: loadingDetails, error: errorDetails };
      case 'getProviderDevices':
        return { data: providerDevices, loading: loadingDevices, error: errorDevices };
      case 'getProviderLocations':
        return { data: providerLocations, loading: loadingLocations, error: errorLocations };
      default:
        return { data: null, loading: false, error: null };
    }
  };

  const { data, loading, error } = getCurrentData();

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h2 className="text-lg font-medium mb-4">Provider API Testing Panel</h2>
      
      {/* Test Address Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Provider Address (optional for some endpoints)</label>
        <input
          type="text"
          value={testAddress}
          onChange={(e) => setTestAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Enter Solana address to test provider-specific endpoints"
        />
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => testEndpoint('getAllProviders')}
          className={`py-2 px-3 rounded-md text-sm font-medium ${
            activeTest === 'getAllProviders' 
              ? 'bg-blue-800 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Get All Providers
        </button>
        <button
          onClick={() => testEndpoint('getRegistryInfo')}
          className={`py-2 px-3 rounded-md text-sm font-medium ${
            activeTest === 'getRegistryInfo' 
              ? 'bg-green-800 text-white' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Get Registry Info
        </button>
        <button
          onClick={() => testEndpoint('getAvailableDevices')}
          className={`py-2 px-3 rounded-md text-sm font-medium ${
            activeTest === 'getAvailableDevices' 
              ? 'bg-purple-800 text-white' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Get Available Devices
        </button>
        <button
          onClick={() => testEndpoint('isProviderRegistered')}
          disabled={!testAddress}
          className={`py-2 px-3 rounded-md text-sm font-medium disabled:opacity-50 ${
            activeTest === 'isProviderRegistered' 
              ? 'bg-orange-800 text-white' 
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          Check Registration
        </button>
        <button
          onClick={() => testEndpoint('getProviderDetails')}
          disabled={!testAddress}
          className={`py-2 px-3 rounded-md text-sm font-medium disabled:opacity-50 ${
            activeTest === 'getProviderDetails' 
              ? 'bg-red-800 text-white' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Get Provider Details
        </button>
        <button
          onClick={() => testEndpoint('getProviderDevices')}
          disabled={!testAddress}
          className={`py-2 px-3 rounded-md text-sm font-medium disabled:opacity-50 ${
            activeTest === 'getProviderDevices' 
              ? 'bg-indigo-800 text-white' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Get Provider Devices
        </button>
        <button
          onClick={() => testEndpoint('getProviderLocations')}
          disabled={!testAddress}
          className={`py-2 px-3 rounded-md text-sm font-medium disabled:opacity-50 ${
            activeTest === 'getProviderLocations' 
              ? 'bg-teal-800 text-white' 
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          Get Provider Locations
        </button>
      </div>

      {/* Clear Results */}
      {activeTest && (
        <button
          onClick={() => setActiveTest('')}
          className="mb-4 bg-gray-500 text-white py-1 px-3 rounded-md text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results Display */}
      {activeTest && !loading && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            Results for: <span className="text-blue-600">{activeTest}</span>
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
            {error ? (
              <div className="text-red-600">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error.message}</p>
              </div>
            ) : data ? (
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No data returned</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Test Addresses */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Quick Test (click to use):</h4>
        <div className="space-y-1">
          <button
            onClick={() => setTestAddress('11111111111111111111111111111111')}
            className="block text-xs text-blue-600 hover:underline"
          >
            System Program: 11111111111111111111111111111111
          </button>
          <button
            onClick={() => setTestAddress('So11111111111111111111111111111111111111112')}
            className="block text-xs text-blue-600 hover:underline"
          >
            SOL Token: So11111111111111111111111111111111111111112
          </button>
        </div>
      </div>
    </div>
  );
}
