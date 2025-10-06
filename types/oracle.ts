/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/oracle.json`.
 */
export type Oracle = {
  "address": "BkKcenZveLhg2LrHiX45hc937nQGpri2nvfvXfdcUZNN",
  "metadata": {
    "name": "oracle",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeDeviceFeed",
      "docs": [
        "Create the feed once (e.g. when a device is first registered)."
      ],
      "discriminator": [
        105,
        189,
        105,
        42,
        142,
        191,
        163,
        123
      ],
      "accounts": [
        {
          "name": "feed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  118,
                  105,
                  99,
                  101,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "channelId"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Device owner or DAO multisig that’s allowed to push updates"
          ],
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "channelId",
          "type": "u32"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateDeviceFeed",
      "docs": [
        "Keeper pushes deltas since `last_entry_id`. We store **running totals**."
      ],
      "discriminator": [
        207,
        28,
        88,
        46,
        66,
        19,
        231,
        173
      ],
      "accounts": [
        {
          "name": "feed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  118,
                  105,
                  99,
                  101,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "channelId"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "channelId",
          "type": "u32"
        },
        {
          "name": "newestEntryId",
          "type": "u32"
        },
        {
          "name": "deltaViews",
          "type": "u64"
        },
        {
          "name": "deltaTaps",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "deviceFeed",
      "discriminator": [
        148,
        156,
        211,
        142,
        23,
        149,
        206,
        54
      ]
    }
  ],
  "events": [
    {
      "name": "deviceFeedInitialized",
      "discriminator": [
        119,
        24,
        34,
        171,
        69,
        27,
        43,
        44
      ]
    },
    {
      "name": "deviceFeedUpdated",
      "discriminator": [
        247,
        146,
        54,
        198,
        65,
        63,
        44,
        52
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "badAuthority",
      "msg": "Caller not authorised"
    },
    {
      "code": 6001,
      "name": "noNewData",
      "msg": "Nothing new to record"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Math overflow"
    }
  ],
  "types": [
    {
      "name": "deviceFeed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "channelId",
            "type": "u32"
          },
          {
            "name": "lastEntryId",
            "type": "u32"
          },
          {
            "name": "totalViews",
            "type": "u64"
          },
          {
            "name": "totalTaps",
            "type": "u64"
          },
          {
            "name": "lastUpdateTs",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "deviceFeedInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "channelId",
            "type": "u32"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "ts",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "deviceFeedUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "channelId",
            "type": "u32"
          },
          {
            "name": "newEntryId",
            "type": "u32"
          },
          {
            "name": "deltaViews",
            "type": "u64"
          },
          {
            "name": "deltaTaps",
            "type": "u64"
          },
          {
            "name": "totalViews",
            "type": "u64"
          },
          {
            "name": "totalTaps",
            "type": "u64"
          },
          {
            "name": "ts",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
