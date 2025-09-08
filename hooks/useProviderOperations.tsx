"use client";

import { api } from "@/trpc/react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { VersionedTransaction } from "@solana/web3.js";
import { useState } from "react";

export interface RegisterProviderInput {
  name: string;
  location: string;
  contactEmail: string;
}

export interface UpdateProviderInput {
  name?: string;
  location?: string;
  contactEmail?: string;
}

export interface AddDeviceInput {
  deviceId: number;
}

/**
 * Hook for provider operations using tRPC and wallet
 */
export function useProviderOperations() {
  const { wallet, type } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutations
  const registerProviderMutation = api.provider.registerProvider.useMutation();
  const updateProviderMutation = api.provider.updateProvider.useMutation();
  const addDeviceMutation = api.provider.addDevice.useMutation();

  /**
   * Register a new provider using tRPC and wallet
   */
  const registerProvider = async (input: RegisterProviderInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await registerProviderMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        ...input,
      });

      // Deserialize and send transaction through wallet
      const transactionBuffer = Buffer.from(result.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Send transaction through wallet - this will trigger Phantom popup
      const txHash = await wallet.sendTransaction({ transaction });
      
      console.log("Provider registered:", {
        txHash,
        adProviderPDA: result.adProviderPDA,
        providerMetadataPDA: result.providerMetadataPDA,
        message: result.message,
      });
      
      return txHash;
    } catch (error) {
      console.error("Provider registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update provider information using tRPC and wallet
   */
  const updateProvider = async (input: UpdateProviderInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await updateProviderMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        ...input,
      });

      // Deserialize and send transaction through wallet
      const transactionBuffer = Buffer.from(result.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Send transaction through wallet
      const txHash = await wallet.sendTransaction({ transaction });
      
      console.log("Provider updated:", {
        txHash,
        message: result.message,
      });
      
      return txHash;
    } catch (error) {
      console.error("Provider update error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add device to provider using tRPC and wallet
   */
  const addDevice = async (input: AddDeviceInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await addDeviceMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        ...input,
      });

      // Deserialize and send transaction through wallet
      const transactionBuffer = Buffer.from(result.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Send transaction through wallet
      const txHash = await wallet.sendTransaction({ transaction });
      
      console.log("Device added:", {
        txHash,
        deviceId: result.deviceId,
        message: result.message,
      });
      
      return txHash;
    } catch (error) {
      console.error("Add device error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Operations
    registerProvider,
    updateProvider,
    addDevice,
    
    // State
    isLoading,
    wallet,
    
    // Raw mutations (if needed for other use cases)
    registerProviderMutation,
    updateProviderMutation,
    addDeviceMutation,
  };
}
