"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useTransferFunds } from "@/hooks/useContractOperations";

const isSolanaAddressValid = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export function TransferFunds() {
  const { transferFunds, isLoading, error, wallet, reset } = useTransferFunds();
  const [token, setToken] = useState<"sol" | "usdc">("sol");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  async function handleOnTransfer() {
    if (!wallet || !recipient || !amount) {
      alert("Transfer: missing required fields");
      return;
    }

    // Validate Solana recipient address
    if (!isSolanaAddressValid(recipient)) {
      alert("Transfer: Invalid Solana recipient address");
      return;
    }

    try {
      reset(); // Clear any previous errors
      setTxnHash(null);
      
      const hash = await transferFunds({
        token,
        recipient,
        amount,
      });

      if (hash) {
        setTxnHash(`https://solscan.io/tx/${hash}?cluster=devnet`);
      }
    } catch (err) {
      console.error("Transfer: ", err);
      alert("Transfer: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Transfer funds</h2>
        <p className="text-sm text-gray-500">Send funds to another wallet</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Token</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "usdc"}
                  onChange={() => setToken("usdc")}
                />
                <span>USDC</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "sol"}
                  onChange={() => setToken("sol")}
                />
                <span>SOL</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="0.00"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recipient wallet</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Enter wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          Error: {error.message}
        </div>
      )}
      <div className="flex flex-col gap-2 w-full">
        <button
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
          onClick={handleOnTransfer}
          disabled={isLoading}
        >
          {isLoading ? "Transferring..." : "Transfer"}
        </button>
        {txnHash && !isLoading && (
          <a
            href={txnHash}
            className="text-sm text-gray-500 text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            → View on Solscan (refresh to update balance)
          </a>
        )}
      </div>
    </div>
  );
}
