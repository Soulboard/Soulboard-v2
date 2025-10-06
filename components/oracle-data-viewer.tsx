"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function OracleDataViewer() {
  const [deviceId, setDeviceId] = useState<number>(2890626); // Default channel ID
  
  // Oracle queries
  const { data: deviceFeed, isLoading: loadingDevice, error: deviceError } = 
    api.oracle.getDeviceFeed.useQuery({ deviceId }, { enabled: !!deviceId });
  
  const { data: channelFeed, isLoading: loadingChannel } = 
    api.oracle.getChannelFeed.useQuery();
  
  const { data: thingSpeakData, isLoading: loadingThingSpeak } = 
    api.oracle.getThingSpeakData.useQuery({ results: 5 });
  
  const { data: allFeeds, isLoading: loadingAll } = 
    api.oracle.getAllDeviceFeeds.useQuery();
  
  const { data: oracleInfo } = api.oracle.getOracleInfo.useQuery();

  const { data: deviceExists } = api.oracle.checkDeviceFeedExists.useQuery({ deviceId });

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Oracle Data Viewer</h1>
      
      {/* Device ID Input */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">
          Device ID to Query:
        </label>
        <input
          type="number"
          value={deviceId}
          onChange={(e) => setDeviceId(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
          placeholder="Device ID"
        />
        {deviceExists && (
          <span className={`ml-2 text-sm ${deviceExists.exists ? 'text-green-600' : 'text-red-600'}`}>
            {deviceExists.exists ? '✓ Feed exists' : '✗ Feed not found'}
          </span>
        )}
      </div>

      {/* Oracle Info */}
      {oracleInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Oracle Program Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Program ID:</strong> {oracleInfo.programId.slice(0, 20)}...
            </div>
            <div>
              <strong>Default Channel:</strong> {oracleInfo.defaultChannelId}
            </div>
            <div>
              <strong>Network:</strong> {oracleInfo.network.includes('devnet') ? 'Devnet' : 'Mainnet'}
            </div>
            <div>
              <strong>Device Seed:</strong> {oracleInfo.constants.DEVICE_SEED}
            </div>
          </div>
        </div>
      )}

      {/* Device Feed Data */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Device Feed Data (ID: {deviceId})</h2>
        {loadingDevice ? (
          <p className="text-gray-500">Loading device feed...</p>
        ) : deviceError ? (
          <p className="text-red-500">Error: {deviceError.message}</p>
        ) : deviceFeed ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <strong>Channel ID:</strong> {deviceFeed.channelId}
            </div>
            <div>
              <strong>Total Views:</strong> {deviceFeed.totalViewsNumber.toLocaleString()}
            </div>
            <div>
              <strong>Total Taps:</strong> {deviceFeed.totalTapsNumber.toLocaleString()}
            </div>
            <div>
              <strong>Last Entry:</strong> {deviceFeed.lastEntryId}
            </div>
            <div className="col-span-2">
              <strong>Authority:</strong> {deviceFeed.authority.slice(0, 20)}...
            </div>
            <div className="col-span-2">
              <strong>Feed PDA:</strong> {deviceFeed.feedPDA.slice(0, 20)}...
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No device feed found for ID {deviceId}</p>
        )}
      </div>

      {/* Channel Feed Data */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Default Channel Feed</h2>
        {loadingChannel ? (
          <p className="text-gray-500">Loading channel feed...</p>
        ) : channelFeed ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <strong>Channel ID:</strong> {channelFeed.channelId}
            </div>
            <div>
              <strong>Total Views:</strong> {channelFeed.totalViewsNumber.toLocaleString()}
            </div>
            <div>
              <strong>Total Taps:</strong> {channelFeed.totalTapsNumber.toLocaleString()}
            </div>
            <div>
              <strong>Last Entry:</strong> {channelFeed.lastEntryId}
            </div>
            <div className="col-span-4">
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                channelFeed.isDefaultChannel ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {channelFeed.isDefaultChannel ? 'Default Channel' : 'Custom Channel'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No channel feed data available</p>
        )}
      </div>

      {/* ThingSpeak API Data */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">ThingSpeak API Data</h2>
        {loadingThingSpeak ? (
          <p className="text-gray-500">Loading ThingSpeak data...</p>
        ) : thingSpeakData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <strong>Channel:</strong> {thingSpeakData.channel.name}
              </div>
              <div>
                <strong>Total Views:</strong> {thingSpeakData.statistics.totalViews.toLocaleString()}
              </div>
              <div>
                <strong>Total Taps:</strong> {thingSpeakData.statistics.totalTaps.toLocaleString()}
              </div>
              <div>
                <strong>Total Feeds:</strong> {thingSpeakData.statistics.totalFeeds}
              </div>
              <div>
                <strong>Latest Entry:</strong> {thingSpeakData.statistics.latestEntryId}
              </div>
              <div>
                <strong>Location:</strong> {thingSpeakData.channel.latitude}, {thingSpeakData.channel.longitude}
              </div>
            </div>
            
            {/* Recent Feeds */}
            <div>
              <h3 className="font-medium mb-2">Recent Feeds (Last 5):</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Entry ID</th>
                      <th className="text-left p-2">Views</th>
                      <th className="text-left p-2">Taps</th>
                      <th className="text-left p-2">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thingSpeakData.feeds.slice(-5).reverse().map((feed) => (
                      <tr key={feed.entryId} className="border-b">
                        <td className="p-2">{feed.entryId}</td>
                        <td className="p-2">{feed.views}</td>
                        <td className="p-2">{feed.taps}</td>
                        <td className="p-2">{new Date(feed.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No ThingSpeak data available</p>
        )}
      </div>

      {/* All Device Feeds Summary */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">All Device Feeds Summary</h2>
        {loadingAll ? (
          <p className="text-gray-500">Loading all feeds...</p>
        ) : allFeeds ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>Total Feeds:</strong> {allFeeds.statistics.totalFeeds}
              </div>
              <div>
                <strong>Total Views:</strong> {allFeeds.statistics.totalViews.toLocaleString()}
              </div>
              <div>
                <strong>Total Taps:</strong> {allFeeds.statistics.totalTaps.toLocaleString()}
              </div>
              <div>
                <strong>Avg Views/Feed:</strong> {allFeeds.statistics.averageViewsPerFeed.toFixed(1)}
              </div>
            </div>
            
            {allFeeds.feeds.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Device Feeds:</h3>
                <div className="grid gap-2">
                  {allFeeds.feeds.map((feed) => (
                    <div key={feed.publicKey} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>Channel {feed.channelId}</span>
                      <span>{feed.totalViewsNumber} views, {feed.totalTapsNumber} taps</span>
                      <span className={`px-2 py-1 rounded ${
                        feed.isDefaultChannel ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {feed.isDefaultChannel ? 'Default' : 'Custom'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No device feeds available</p>
        )}
      </div>
    </div>
  );
}