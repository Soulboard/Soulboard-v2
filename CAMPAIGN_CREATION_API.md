# Campaign Creation API

This document explains how to use the new campaign creation functionality in the Soulboard application.

## Overview

The campaign creation feature allows users to create advertising campaigns on the Soulboard platform. This is implemented through:

1. **tRPC Endpoint**: `contracts.createCampaign` - Backend API for creating campaign transactions
2. **React Hook**: `useContractOperations` - Frontend hook with `createCampaign` function
3. **React Component**: `CreateCampaignForm` - UI component for campaign creation

## Backend API

### tRPC Endpoint: `contracts.createCampaign`

**Location**: `/server/api/routers/contracts.ts`

**Input Schema**:
```typescript
{
  wallet: {
    address: string;
    type: "solana-smart-wallet";
  },
  campaignId: number; // Positive integer
  campaignName: string; // 1-100 characters
  campaignDescription: string; // 1-500 characters
  runningDays: number; // 1-365 days
  hoursPerDay: number; // 1-24 hours
  baseFeePerHour: number; // In SOL, positive number
}
```

**Returns**:
```typescript
{
  transaction: string; // Base64 encoded transaction
  campaignPDA: string; // Campaign Program Derived Address
  campaignId: number;
  message: string; // Success message
  details: {
    runningDays: number;
    hoursPerDay: number;
    baseFeePerHour: number;
    baseFeePerHourLamports: string; // Converted to lamports
  };
}
```

## Frontend Hook

### `useContractOperations().createCampaign`

**Location**: `/hooks/useContractOperations.tsx`

**Function Signature**:
```typescript
const createCampaign = async (input: CreateCampaignInput): Promise<string | null>
```

**Input Type**:
```typescript
interface CreateCampaignInput {
  campaignId: number;
  campaignName: string;
  campaignDescription: string;
  runningDays: number;
  hoursPerDay: number;
  baseFeePerHour: number; // In SOL
}
```

**Usage Example**:
```typescript
import { useContractOperations } from "@/hooks/useContractOperations";

function MyComponent() {
  const { createCampaign, createCampaignState, isLoading } = useContractOperations();

  const handleCreateCampaign = async () => {
    try {
      const txHash = await createCampaign({
        campaignId: 1,
        campaignName: "My Campaign",
        campaignDescription: "This is a test campaign",
        runningDays: 7,
        hoursPerDay: 8,
        baseFeePerHour: 0.001, // 0.001 SOL per hour
      });
      
      console.log("Campaign created with transaction:", txHash);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  return (
    <button 
      onClick={handleCreateCampaign}
      disabled={isLoading}
    >
      {isLoading ? "Creating..." : "Create Campaign"}
    </button>
  );
}
```

## UI Component

### `CreateCampaignForm`

**Location**: `/components/create-campaign.tsx`

A complete form component for creating campaigns with:
- Input validation
- Real-time cost calculation
- Error handling
- Loading states
- Success feedback

**Usage**:
```tsx
import { CreateCampaignForm } from "@/components/create-campaign";

function CampaignPage() {
  return (
    <div>
      <h1>Create New Campaign</h1>
      <CreateCampaignForm />
    </div>
  );
}
```

## Campaign Creation Flow

1. **User Input**: User fills out the campaign form with required details
2. **Validation**: Frontend validates input (campaign ID uniqueness should be handled by user)
3. **Transaction Building**: Backend creates a Solana transaction for the `create_campaign` instruction
4. **Wallet Signing**: Frontend deserializes the transaction and sends it to the user's wallet
5. **Blockchain Execution**: User approves and the transaction is executed on Solana
6. **Confirmation**: Transaction hash is returned and campaign PDA is created

## Key Features

### Campaign Parameters

- **Campaign ID**: Unique identifier (user-defined)
- **Name & Description**: Campaign metadata
- **Running Days**: How many days the campaign will run (1-365)
- **Hours Per Day**: How many hours per day ads will run (1-24)
- **Base Fee Per Hour**: Payment rate in SOL per hour per device

### Cost Calculation

Total base cost per device = `runningDays × hoursPerDay × baseFeePerHour`

Example: 7 days × 8 hours × 0.001 SOL = 0.056 SOL per device

### Error Handling

The system handles various error scenarios:
- Invalid wallet address
- Duplicate campaign IDs (handled by Solana program)
- Invalid input parameters
- Transaction failures
- Network issues

## Integration Notes

### Prerequisites

1. User must have a connected Solana wallet (Crossmint smart wallet)
2. User must have sufficient SOL for transaction fees
3. Campaign ID must be unique for the user's address

### Next Steps After Campaign Creation

After creating a campaign, users typically need to:
1. Add budget to the campaign using `addBudget`
2. Book advertising devices using `addLocation`
3. Monitor campaign performance
4. Complete the campaign when finished

## Error Codes

Common error scenarios:
- `"Invalid wallet address"`: Wallet address format is incorrect
- `"Campaign creation failed"`: Generic blockchain transaction failure
- `"Wallet not connected"`: User needs to connect wallet first
- Account already exists: Campaign ID already used by this user

## Testing

The campaign creation functionality can be tested with:
- Unit tests for the tRPC endpoint
- Integration tests with mock wallet
- End-to-end tests with testnet

For testing, use small values:
- `baseFeePerHour: 0.001` (1/1000 SOL)
- `runningDays: 1-3`
- `hoursPerDay: 1-8`

This ensures minimal cost during testing while validating the full flow.
