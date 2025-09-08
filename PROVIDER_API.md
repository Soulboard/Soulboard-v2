# Provider Router API Documentation

This document describes the provider router endpoints for managing advertising service providers (ASPs) in the Soulboard system.

## Endpoints

### 1. Register Provider
**Method**: `provider.registerProvider`  
**Type**: Mutation  
**Description**: Register a new advertising service provider (ASP)

**Input**:
```typescript
{
  wallet: {
    address: string;
    type: "solana-smart-wallet";
  };
  name: string; // 1-100 characters
  location: string; // 1-200 characters  
  contactEmail: string; // Valid email, max 150 characters
}
```

**Output**:
```typescript
{
  transaction: string; // Base64 encoded transaction
  message: string;
  adProviderPDA: string;
  providerMetadataPDA: string;
}
```

### 2. Update Provider
**Method**: `provider.updateProvider`  
**Type**: Mutation  
**Description**: Update an existing provider's information

**Input**:
```typescript
{
  wallet: {
    address: string;
    type: "solana-smart-wallet";
  };
  name?: string; // Optional, 1-100 characters
  location?: string; // Optional, 1-200 characters
  contactEmail?: string; // Optional, valid email, max 150 characters
  isActive?: boolean; // Optional
}
```

**Output**:
```typescript
{
  transaction: string; // Base64 encoded transaction
  message: string;
}
```

### 3. Add Device
**Method**: `provider.addDevice`  
**Type**: Mutation  
**Description**: Add a device to provider's inventory

**Input**:
```typescript
{
  wallet: {
    address: string;
    type: "solana-smart-wallet";
  };
  deviceId: number; // Positive integer
}
```

**Output**:
```typescript
{
  transaction: string; // Base64 encoded transaction
  message: string;
  deviceId: number;
}
```

### 4. Get All Providers
**Method**: `provider.getAllProviders`  
**Type**: Query  
**Description**: Get list of all registered providers

**Input**: None

**Output**:
```typescript
{
  providers: string[]; // Array of provider public keys
  totalProviders: number;
}
```

### 5. Get Provider Details
**Method**: `provider.getProviderDetails`  
**Type**: Query  
**Description**: Get detailed information about a specific provider

**Input**:
```typescript
{
  providerAddress: string; // Provider's public key
}
```

**Output**:
```typescript
{
  adProvider: {
    authority: string;
    name: string;
    location: string;
    contactEmail: string;
    rating: number;
    totalCampaigns: number;
    isActive: boolean;
    totalEarnings: string; // Amount in lamports as string
    pendingPayments: string; // Amount in lamports as string
    devices: Array<{
      deviceId: number;
      deviceState: "available" | "booked" | "ordered" | "paused";
    }>;
  };
  metadata: {
    authority: string;
    providerPda: string;
    name: string;
    location: string;
    deviceCount: number;
    availableDevices: number;
    rating: number;
    isActive: boolean;
  };
}
```

### 6. Get Registry Info
**Method**: `provider.getRegistryInfo`  
**Type**: Query  
**Description**: Get provider registry information

**Input**: None

**Output**:
```typescript
{
  deployer: string; // Registry deployer's public key
  totalProviders: number;
  providers: string[]; // Array of provider public keys
  keepers: string[]; // Array of keeper public keys
  registryPDA: string;
}
```

### 7. Check Provider Registration
**Method**: `provider.isProviderRegistered`  
**Type**: Query  
**Description**: Check if a provider is registered

**Input**:
```typescript
{
  providerAddress: string; // Provider's public key
}
```

**Output**:
```typescript
{
  isRegistered: boolean;
  providerPDA: string;
}
```

## Error Handling

All endpoints handle the following error cases:
- `BAD_REQUEST`: Invalid input data (e.g., invalid wallet address)
- `NOT_FOUND`: Provider or registry not found
- `INTERNAL_SERVER_ERROR`: Other server-side errors

## Usage Notes

1. **Transaction Signing**: All mutation endpoints return base64-encoded transactions that need to be signed by the client wallet.

2. **PDAs**: The system uses Program Derived Addresses (PDAs) for provider accounts:
   - `ad_provider`: Main provider account
   - `provider_metadata`: Provider metadata account
   - `provider_registry`: Global provider registry

3. **Device States**: Devices can be in one of four states:
   - `available`: Ready for booking
   - `booked`: Reserved for a campaign
   - `ordered`: Physical device ordered but not yet deployed
   - `paused`: Temporarily unavailable

4. **Registry Dependencies**: Most operations require the provider registry to be initialized first.

## Test Data Reference

Based on the test file, here are example provider registrations:

```typescript
// Bob's Digital Displays
{
  name: "Bob's Premium Displays",
  location: "Manhattan, NY", 
  contactEmail: "contact@bobdisplays.com"
}

// Carol's Smart Boards
{
  name: "Carol's Smart Boards",
  location: "Los Angeles, CA",
  contactEmail: "carol@smartboards.com"  
}

// Dave's LED Solutions
{
  name: "Dave's LED Solutions", 
  location: "Chicago, IL",
  contactEmail: "dave@ledsolutions.com"
}
```
