"use client";

import { api } from "@/lib/api";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { VersionedTransaction } from "@solana/web3.js";
import { useState } from "react";

export interface ContractTransferInput {
  token: "sol" | "usdc";
  recipient: string;
  amount: number;
}

export interface ContractMethodInput {
  method: string;
  args?: any[];
}

export interface CreateCampaignInput {
  campaignId: number;
  campaignName: string;
  campaignDescription: string;
  runningDays: number;
  hoursPerDay: number;
  baseFeePerHour: number; // In SOL
  initialBudget?: number; // In SOL
}

export interface AddBudgetInput {
  campaignId: number;
  amount: number; // In SOL
}

/**
 * Hook for contract operations using tRPC
 */
export function useContractOperations() {
  const { wallet, type } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutations
  const transferMutation = api.contracts.transfer.useMutation();
  const executeMutation = api.contracts.executeSoulboardMethod.useMutation();
  const createCampaignMutation = api.contracts.createCampaign.useMutation();
  const addBudgetMutation = api.contracts.addBudget.useMutation();
  
  // tRPC queries
  const getBalance = api.contracts.getBalance.useQuery;
  const getAccount = api.contracts.getSoulboardAccount.useQuery;

  /**
   * Execute a transfer using tRPC and wallet
   */
  const executeTransfer = async (input: ContractTransferInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await transferMutation.mutateAsync({
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
      
      return txHash;
    } catch (error) {
      console.error("Transfer execution error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Execute a contract method using tRPC
   */
  const executeContractMethod = async (input: ContractMethodInput): Promise<any> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation
      const result = await executeMutation.mutateAsync({
        wallet: {
          address: wallet.address,
          type: "solana-smart-wallet",
        },
        ...input,
      });

      return result;
    } catch (error) {
      console.error("Contract method execution error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new campaign using tRPC and wallet
   */
  const createCampaign = async (input: CreateCampaignInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await createCampaignMutation.mutateAsync({
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
      
      console.log("Campaign created:", {
        txHash,
        campaignPDA: result.campaignPDA,
        campaignId: result.campaignId,
        message: result.message,
        details: result.details,
      });
      
      return txHash;
    } catch (error) {
      console.error("Create campaign error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add budget to an existing campaign using tRPC and wallet
   */
  const addBudget = async (input: AddBudgetInput): Promise<string | null> => {
    if (!wallet || type !== "solana-smart-wallet") {
      throw new Error("Wallet not connected or wrong type");
    }

    try {
      setIsLoading(true);

      // Call tRPC mutation to get transaction
      const result = await addBudgetMutation.mutateAsync({
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
      
      console.log("Budget added:", {
        txHash,
        campaignPDA: result.campaignPDA,
        campaignId: result.campaignId,
        message: result.message,
        details: result.details,
      });
      
      return txHash;
    } catch (error) {
      console.error("Add budget error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get balance for current wallet
   */
  const useWalletBalance = (tokenMint?: string) => {
    return getBalance(
      {
        address: wallet?.address || "",
        tokenMint,
      },
      {
        enabled: !!wallet?.address,
        refetchInterval: 10000, // Refresh every 10 seconds
      }
    );
  };

  /**
   * Get balance for any address
   */
  const useAddressBalance = (address: string, tokenMint?: string) => {
    return getBalance(
      {
        address,
        tokenMint,
      },
      {
        enabled: !!address,
        refetchInterval: 30000, // Refresh every 30 seconds
      }
    );
  };

  /**
   * Get account data
   */
  const useAccountData = (accountAddress: string, accountType?: "campaign" | "providerRegistry" | "providerMetadata" | "soulboard") => {
    return getAccount(
      {
        accountAddress,
        accountType,
      },
      {
        enabled: !!accountAddress,
      }
    );
  };

  return {
    // State
    isLoading: isLoading || transferMutation.isPending || executeMutation.isPending || createCampaignMutation.isPending || addBudgetMutation.isPending,
    wallet,
    
    // Actions
    executeTransfer,
    executeContractMethod,
    createCampaign,
    addBudget,
    
    // Queries (hooks)
    useWalletBalance,
    useAddressBalance,
    useAccountData,
    
    // Mutation states
    transferState: {
      isLoading: transferMutation.isPending,
      error: transferMutation.error,
      data: transferMutation.data,
      reset: transferMutation.reset,
    },
    createCampaignState: {
      isLoading: createCampaignMutation.isPending,
      error: createCampaignMutation.error,
      data: createCampaignMutation.data,
      reset: createCampaignMutation.reset,
    },
    addBudgetState: {
      isLoading: addBudgetMutation.isPending,
      error: addBudgetMutation.error,
      data: addBudgetMutation.data,
      reset: addBudgetMutation.reset,
    },
    contractMethodState: {
      isLoading: executeMutation.isPending,
      error: executeMutation.error,
      data: executeMutation.data,
      reset: executeMutation.reset,
    },
  };
}

/**
 * Simplified hook for just transfers (backward compatibility)
 */
export function useTransferFunds() {
  const { executeTransfer, transferState, isLoading, wallet } = useContractOperations();
  
  return {
    transferFunds: executeTransfer,
    isLoading,
    error: transferState.error,
    wallet,
    reset: transferState.reset,
  };
}

/**
 * Hook for contract method calls
 */
export function useContractMethods() {
  const { executeContractMethod, contractMethodState, isLoading, wallet } = useContractOperations();
  
  return {
    executeMethod: executeContractMethod,
    isLoading,
    error: contractMethodState.error,
    data: contractMethodState.data,
    wallet,
    reset: contractMethodState.reset,
  };
}

/**
 * Hook for balance queries
 */
export function useBalances() {
  const { useWalletBalance, useAddressBalance, wallet } = useContractOperations();
  
  return {
    useWalletBalance,
    useAddressBalance,
    wallet,
  };
}
