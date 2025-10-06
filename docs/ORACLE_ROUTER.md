# Oracle Router Documentation

The Oracle Router provides endpoints to interact with device feed data from the Oracle program. It integrates with ThingSpeak channels to fetch real-time device performance data.

## Available Endpoints

### 1. `getDeviceFeed`
Get device feed data from oracle program by device ID.

```typescript
const deviceFeed = await api.oracle.getDeviceFeed.query({ deviceId: 100 });
```

**Response:**
```typescript
{
  deviceId: number;
  channelId: number;
  totalViews: string;
  totalTaps: string;
  lastEntryId: number;
  authority: string;
  feedPDA: string;
  totalViewsNumber: number;
  totalTapsNumber: number;
}
```

### 2. `getChannelFeed`
Get channel feed data by channel ID (defaults to 2890626 from integration script).

```typescript
const channelFeed = await api.oracle.getChannelFeed.query({ channelId: 2890626 });
// Or use default channel:
const defaultChannelFeed = await api.oracle.getChannelFeed.query();
```

### 3. `getThingSpeakData`
Get ThingSpeak channel data directly from API.

```typescript
const thingSpeakData = await api.oracle.getThingSpeakData.query({ 
  channelId: 2890626, 
  results: 10 
});
```

**Response includes:**
- Channel information (name, description, location, etc.)
- Processed feeds with views and taps data
- Statistics (totals, averages)
- Metadata

### 4. `getAllDeviceFeeds`
Get all initialized device feeds.

```typescript
const allFeeds = await api.oracle.getAllDeviceFeeds.query();
```

### 5. `getOracleInfo`
Get oracle program information and constants.

```typescript
const oracleInfo = await api.oracle.getOracleInfo.query();
```

### 6. `checkDeviceFeedExists`
Check if a device feed exists for a given device ID.

```typescript
const exists = await api.oracle.checkDeviceFeedExists.query({ deviceId: 100 });
```

## Integration with Tests

The oracle router follows the same patterns used in the test file:

1. **Device Feed PDAs**: Uses the same PDA derivation logic as tests
2. **Channel ID**: Uses the default channel 2890626 from the integration script
3. **Data Types**: Matches the DeviceFeedAccount interface from tests
4. **Error Handling**: Properly handles missing feeds and oracle unavailability

## Usage Examples

### Getting Real-time Device Performance
```typescript
// Get device performance data
const deviceData = await api.oracle.getDeviceFeed.query({ deviceId: 100 });
console.log(`Device ${deviceData.deviceId}: ${deviceData.totalViewsNumber} views, ${deviceData.totalTapsNumber} taps`);

// Compare with ThingSpeak API data
const thingSpeakData = await api.oracle.getThingSpeakData.query({ results: 1 });
console.log(`Latest ThingSpeak entry: ${thingSpeakData.statistics.totalViews} views`);
```

### Campaign Performance Monitoring
```typescript
// Get all device feeds for campaign monitoring
const allFeeds = await api.oracle.getAllDeviceFeeds.query();
const totalPerformance = {
  views: allFeeds.statistics.totalViews,
  taps: allFeeds.statistics.totalTaps,
  devices: allFeeds.feeds.length
};
```

### Health Checks
```typescript
// Check if oracle system is working
const oracleInfo = await api.oracle.getOracleInfo.query();
const channelData = await api.oracle.getThingSpeakData.query();
const isHealthy = channelData.statistics.totalFeeds > 0;
```

## Constants

- **Default Channel ID**: 2890626 (from integration script)
- **Device Seed**: "device_feed"
- **Oracle Program ID**: BkKcenZveLhg2LrHiX45hc937nQGpri2nvfvXfdcUZNN

## Error Handling

The router handles several error cases:
- Device feed not found (NOT_FOUND)
- Oracle program unavailable (INTERNAL_SERVER_ERROR)
- ThingSpeak API failures (INTERNAL_SERVER_ERROR)
- Invalid device IDs (BAD_REQUEST via Zod validation)

## Integration with Provider Operations

The oracle router complements the provider operations by providing real-time performance data that can be used for:
- Fee calculations based on actual device performance
- Campaign effectiveness monitoring
- Device availability and health status
- Provider earnings calculations based on views/taps