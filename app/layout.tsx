import React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/app/providers";
import { Toaster } from "react-hot-toast"; // Added toast provider

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-heading',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: "Solana Wallets Quickstart",
  description: "A quickstart for the Solana Wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                borderRadius: '8px',
                padding: '12px 16px',
                background: '#f5f5f5',
                color: '#223241',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
