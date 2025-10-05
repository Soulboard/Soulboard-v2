"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { api } from "@/trpc/react";
import { useProviderOperations } from "@/hooks/useProviderOperations";
import toast, { Toaster } from "react-hot-toast";
import {
  Check,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  Monitor,
  Wifi,
  Plus,
} from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function ProviderManagement() {
  //const { wallet } = useWallet();
  const wallet = { address: "8s4ZzYpM7rQ7w7WZx3rXg2ZfV7k5nRz1a2b3c4d5e6f" };
  
  const {
    registerProvider,
    addDevice,
    updateProvider,
    isLoading: providerOperationsLoading,
  } = useProviderOperations();

  const utils = api.useUtils();

  // keep the same UI tabs & states from your original UI
  const [activeTab, setActiveTab] = useState<
    "register" | "devices" | "locations" | "available"
  >("register");

  // We'll default selectedProvider to the connected wallet address (if any),
  // but allow the user to pick another provider from allProviders when needed.
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  // Forms (kept identical to your original UI)
  const [providerForm, setProviderForm] = useState({
    name: "",
    location: "",
    contactEmail: "",
  });

  const [deviceForm, setDeviceForm] = useState({
    deviceId: "",
  });

  // queries from the integration file (keeps all backend integrations)
  const { data: allProviders, refetch: refetchProviders } =
    api.provider.getAllProviders.useQuery();
  const { data: registryInfo } = api.provider.getRegistryInfo.useQuery();
  const { data: availableDevices } = api.provider.getAvailableDevices.useQuery();

  // set selectedProvider to wallet address on connect (if user hasn't selected another)
  useEffect(() => {
    if (wallet?.address) {
      // only override when selectedProvider is empty or equals previous wallet address
      setSelectedProvider((prev) => (prev === "" ? wallet.address : prev));
    } else {
      setSelectedProvider("");
    }
  }, [wallet?.address]);

  // provider-specific queries use selectedProvider (which defaults to wallet.address)
  const { data: providerDetails } = api.provider.getProviderDetails.useQuery(
    { providerAddress: selectedProvider || "" },
    { enabled: !!selectedProvider }
  );

  const { data: providerDevicesData } = api.provider.getProviderDevices.useQuery(
    { providerAddress: selectedProvider || "", includeMetadata: true },
    { enabled: !!selectedProvider }
  );

  const { data: providerLocations } = api.provider.getProviderLocations.useQuery(
    { providerAddress: selectedProvider || "" },
    { enabled: !!selectedProvider }
  );

  // keep check if the connected wallet is registered
  const { data: isRegistered } = api.provider.isProviderRegistered.useQuery(
    { providerAddress: wallet?.address || "" },
    { enabled: !!wallet?.address }
  );

  // small helper to update the form fields
  const handleInputChange = (field: keyof typeof providerForm, value: string) => {
    setProviderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // register provider — integrated with providerOperations.registerProvider and toasts
  const handleRegisterProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const txHash = await registerProvider({
        name: providerForm.name,
        location: providerForm.location,
        contactEmail: providerForm.contactEmail,
      });

      if (txHash) {
        toast.success(`Provider registered successfully! TX: ${txHash}`);
        refetchProviders();
        // Invalidate relevant caches
        utils.provider.isProviderRegistered.invalidate({
          providerAddress: wallet.address,
        });
        utils.provider.getProviderDetails.invalidate({
          providerAddress: wallet.address,
        });
        setProviderForm({ name: "", location: "", contactEmail: "" });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // add device — integrated with providerOperations.addDevice and toasts
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address || !deviceForm.deviceId) {
      toast.error("Connect wallet and enter a device ID");
      return;
    }

    try {
      const txHash = await addDevice({
        deviceId: parseInt(deviceForm.deviceId),
      });

      if (txHash) {
        toast.success(`Device added successfully! TX: ${txHash}`);
        setDeviceForm({ deviceId: "" });
        // refresh provider devices (for selectedProvider or wallet)
        const target = selectedProvider || wallet.address;
        if (target) {
          utils.provider.getProviderDevices.invalidate({
            providerAddress: target,
            includeMetadata: true,
          });
        }
      }
    } catch (error) {
      console.error("Add device failed:", error);
      toast.error(
        `Add device failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // map click handler (keeps your interactive picker behaviour)
  const handleMapClick = (lat: number, lng: number, address?: string) => {
    const locationString = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setProviderForm((prev) => ({
      ...prev,
      location: locationString,
    }));
  };

   function LocationPicker({ onLocationSelect }: { onLocationSelect: (location: string) => void }) {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center as fallback
    const [mapKey, setMapKey] = useState(0); // For forcing map re-render

    useEffect(() => {
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLocation: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setMapCenter(userLocation);
            setMapKey(prev => prev + 1); // Force map to re-render with new center
          },
          (error) => {
            console.log("Location access denied, using default center of India");
          }
        );
      }
    }, []);

    const LocationMarker = () => {
      useMapEvents({
        click(e) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
      });

      return position ? <Marker position={position} /> : null;
    };

    return (
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={13}
        style={{ height: '320px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker />
      </MapContainer>
    );
  }


  // if there's no wallet connected — show the same "Wallet Required" UI you had
  if (!wallet?.address) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Wallet Required</h2>
              <p className="text-white/60">Please connect your wallet to manage providers.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main integrated UI (keeps your original UI styling & layout)
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
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

      {/* Wallet & Registry Info Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Wallet</h3>
          </div>
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-xs text-white/50 mb-1">Address</p>
            <p className="text-sm font-mono text-white">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 inline-flex items-center gap-2 rounded-full text-xs font-semibold ${
              isRegistered?.isRegistered
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isRegistered?.isRegistered ? "bg-green-400" : "bg-yellow-400"
              }`}
            />
            {isRegistered?.isRegistered ? "Registered Provider" : "Not Registered"}
          </span>
        </div>

        {/* Registry Info Card */}
        {registryInfo && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Network Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-2xl font-bold text-white mb-1">{registryInfo.totalProviders}</p>
                <p className="text-xs text-white/60">Total Providers</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-2xl font-bold text-white mb-1">{registryInfo.keepers.length}</p>
                <p className="text-xs text-white/60">Active Keepers</p>
              </div>
            </div>
            <div className="mt-3 bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/50 mb-1">Contract Deployer</p>
              <code className="text-xs font-mono text-white/80">
                {registryInfo.deployer.slice(0, 6)}...{registryInfo.deployer.slice(-6)}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Provider Details Card */}
      {isRegistered?.isRegistered && providerDetails && (
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Provider Profile</h3>
                <p className="text-xs text-white/50">Registered on-chain</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-2">Provider Name</p>
              <p className="text-white font-semibold">{(providerDetails as any).adProvider?.name || "N/A"}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-2">Location</p>
              <p className="text-white font-semibold">{(providerDetails as any).adProvider?.location || "N/A"}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-2">Contact Email</p>
              <p className="text-white font-semibold">{(providerDetails as any).adProvider?.contactEmail || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card (your UI preserved) */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "register", label: "Register", icon: Building2 },
            { key: "devices", label: "Devices", icon: Monitor },
            { key: "locations", label: "Locations", icon: MapPin },
            { key: "available", label: "Available", icon: Wifi },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.key
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Register Tab */}
        {activeTab === "register" && (
          <div className="space-y-6">
            {isRegistered?.isRegistered ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Already Registered</p>
                  <p className="text-green-400/80">You are already registered as a provider on the network.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Provider Information</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Provider Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Acme IoT Solutions"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        value={providerForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                      <p className="mt-1.5 text-xs text-white/50">Your business or organization name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-400" />
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        placeholder="contact@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                        value={providerForm.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        required
                      />
                      <p className="mt-1.5 text-xs text-white/50">Primary contact email for communications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Location</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Business Address *</label>
                      <input
                        type="text"
                        placeholder="Enter your business address or click on the map"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        value={providerForm.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                      />
                      <p className="mt-1.5 text-xs text-white/50">Your primary business location or service area</p>
                    </div>

                  <div className="relative">
                      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <LocationPicker 
                          onLocationSelect={(location) => handleInputChange("location", location)}
                        />
                      </div>
                      
                      {providerForm.location && (
                        <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                          <p className="text-xs text-white/60 mb-1">Selected Coordinates</p>
                          <p className="text-sm font-medium text-white">
                            {providerForm.location}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex items-start gap-2 text-xs text-white/50">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Map will center on your location automatically. Click anywhere to select coordinates, or type the address manually above.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleRegisterProvider}
                    disabled={
                      providerOperationsLoading ||
                      !wallet?.address ||
                      !providerForm.name ||
                      !providerForm.location ||
                      !providerForm.contactEmail
                    }
                    className={`px-8 py-3.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      providerOperationsLoading ||
                      !wallet?.address ||
                      !providerForm.name ||
                      !providerForm.location ||
                      !providerForm.contactEmail
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
                    }`}
                  >
                    {providerOperationsLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-black rounded-full animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Register Provider
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === "devices" && (
          <div className="space-y-6">
            {isRegistered?.isRegistered && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Add New Device</h3>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter device ID"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    value={deviceForm.deviceId}
                    onChange={(e) => setDeviceForm({ deviceId: e.target.value })}
                  />
                  <button
                    onClick={handleAddDevice}
                    disabled={providerOperationsLoading || !deviceForm.deviceId || !wallet?.address}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      providerOperationsLoading || !deviceForm.deviceId || !wallet?.address
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Device
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-400" />
                Your Devices
              </h3>

              {providerDevicesData?.summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-white">{providerDevicesData.summary.totalDevices}</p>
                    <p className="text-xs text-white/60">Total</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-green-400">{providerDevicesData.summary.availableDevices}</p>
                    <p className="text-xs text-white/60">Available</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-blue-400">{providerDevicesData.summary.bookedDevices}</p>
                    <p className="text-xs text-white/60">Booked</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-yellow-400">{providerDevicesData.summary.orderedDevices}</p>
                    <p className="text-xs text-white/60">Ordered</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-red-400">{providerDevicesData.summary.pausedDevices}</p>
                    <p className="text-xs text-white/60">Paused</p>
                  </div>
                </div>
              )}

              {providerDevicesData?.devices && providerDevicesData.devices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providerDevicesData.devices.map((device: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Device #{device.deviceId}</p>
                            <p className="text-xs text-white/50">{device.status}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                            device.status === "available"
                              ? "bg-green-500/20 text-green-400"
                              : device.status === "booked"
                              ? "bg-blue-500/20 text-blue-400"
                              : device.status === "paused"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/50">Location:</span>
                          <span className="text-white">{device.location || "N/A"}</span>
                        </div>
                        {device.metadata && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-white/50">Provider:</span>
                              <span className="text-white">{device.metadata.providerName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/50">Rating:</span>
                              <span className="text-white">{device.metadata.providerRating || 0}/5</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <Monitor className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No devices registered yet</p>
                  <p className="text-white/40 text-sm mt-2">Add your first device to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Your Locations
            </h3>
            {Array.isArray(providerLocations) && providerLocations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerLocations.map((location: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <MapPin className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No locations registered yet</p>
                <p className="text-white/40 text-sm mt-2">Your registered address will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Available Devices Tab */}
        {activeTab === "available" && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-400" />
              Available Devices on Network
            </h3>
            {Array.isArray(availableDevices) && availableDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDevices.map((device: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Device #{device.deviceId || idx}</p>
                          <p className="text-xs text-white/50">{device.providerAddress?.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-500/20 text-green-400">
                        Available
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Provider:</span>
                        <span className="text-white">{device.providerName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Location:</span>
                        <span className="text-white">{device.location || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Wifi className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No available devices on the network</p>
                <p className="text-white/40 text-sm mt-2">Devices will appear here when providers register them</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
