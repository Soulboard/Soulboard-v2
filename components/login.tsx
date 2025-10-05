"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";

export function LoginButton() {
  const { login } = useAuth();

  return (
    <button
      className="w-full py-2 px-4 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
      onClick={login}
    >
      Connect Wallet
    </button>
  );
}
