"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { WalletBalance } from "@/components/balance";
import { TransferFunds } from "@/components/transfer";
import { DelegatedSigner } from "@/components/delegated-signer";
import { LogoutButton } from "@/components/logout";
import { LoginButton } from "@/components/login";
import { CreateCampaignForm } from "@/components/create-campaign";
import { UserCampaigns } from "@/components/user-campaigns";
import { ProviderManagement } from "@/components/provider-management";
import { ProviderTestingPanel } from "@/components/provider-testing-panel";

export function HomeContent() {
  const { wallet, status: walletStatus } = useWallet();
  const { status, status: authStatus } = useAuth();

  const walletAddress = wallet?.address;
  const isLoggedIn = wallet != null && status === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
        />
        <h1 className="text-xl font-medium">Solana Wallets Quickstart</h1>
        <div className="max-w-md mt-3 w-full min-h-[38px]">
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col mb-8">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
          className="mb-4"
        />
        <h1 className="text-2xl font-semibold mb-2">
          Solana Wallets Quickstart
        </h1>
        <p className="text-gray-600 text-sm">
          The easiest way to build onchain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white flex flex-col gap-3 justify-between rounded-xl border shadow-sm p-5 overflow-hidden">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-medium">Your wallet</h2>
              <div className="flex items-center gap-2">
                <p className="text-[15px] text-gray-500">
                  {walletAddress
                    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(
                        -4
                      )}`
                    : ""}
                </p>
                <button
                  onClick={() => {
                    if (walletAddress) {
                      navigator.clipboard.writeText(walletAddress);
                      const button =
                        document.activeElement as HTMLButtonElement;
                      button.disabled = true;
                      const originalContent = button.innerHTML;
                      button.innerHTML = `<img src="/check.svg" alt="Check" width="16" height="16" />`;
                      setTimeout(() => {
                        button.innerHTML = originalContent;
                        button.disabled = false;
                      }, 2000);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Image src="/copy.svg" alt="Copy" width={16} height={16} />
                </button>
              </div>
            </div>
            <WalletBalance />
          </div>
          <LogoutButton />
        </div>
        <TransferFunds />
        <DelegatedSigner />
      </div>

      {/* User Campaigns Section */}
      <div className="mt-8">
        <UserCampaigns />
      </div>

      {/* Campaign Creation Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>
        <CreateCampaignForm />
      </div>

      {/* Provider Management Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Provider Management</h2>
        <ProviderManagement />
      </div>

      {/* API Testing Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">API Testing</h2>
        <ProviderTestingPanel />
      </div>

      {/* Locations and Providers Section */}
      

      {/* Location Management Section */}
    
    </div>
  );
}
