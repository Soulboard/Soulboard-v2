/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/soulboard_core.json`.
 */
export type SoulboardCore = {
  "address": "6GetNC8W9RUzWeTbk5VmKhfwpakhzAqjEPffGJMtq8y7",
  "metadata": {
    "name": "soulboardCore",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addBudget",
      "discriminator": [
        8,
        21,
        47,
        83,
        188,
        233,
        214,
        5
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addKeeper",
      "discriminator": [
        73,
        181,
        232,
        2,
        99,
        47,
        150,
        179
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "providerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "keeper",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "addLocation",
      "discriminator": [
        90,
        50,
        252,
        114,
        26,
        199,
        72,
        174
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "location"
              }
            ]
          }
        },
        {
          "name": "providerMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "location"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        },
        {
          "name": "location",
          "type": "pubkey"
        },
        {
          "name": "deviceId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "calculateAndDistributeFees",
      "discriminator": [
        46,
        9,
        165,
        255,
        190,
        253,
        104,
        103
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign.authority",
                "account": "campaign"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "providerRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "completeCampaign",
      "discriminator": [
        238,
        164,
        40,
        81,
        211,
        55,
        55,
        26
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign.authority",
                "account": "campaign"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "providerRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        },
        {
          "name": "campaignName",
          "type": "string"
        },
        {
          "name": "campaignDescription",
          "type": "string"
        },
        {
          "name": "runningDays",
          "type": "u32"
        },
        {
          "name": "hoursPerDay",
          "type": "u32"
        },
        {
          "name": "baseFeePerHour",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getAllProviders",
      "discriminator": [
        82,
        15,
        164,
        198,
        204,
        191,
        49,
        81
      ],
      "accounts": [
        {
          "name": "providerRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "getDevice",
      "discriminator": [
        187,
        176,
        72,
        3,
        250,
        21,
        28,
        62
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "providerMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deviceId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initializeRegistry",
      "discriminator": [
        189,
        181,
        20,
        17,
        174,
        57,
        249,
        59
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "providerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerProvider",
      "discriminator": [
        254,
        209,
        54,
        184,
        46,
        197,
        109,
        78
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "providerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "providerMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "contactEmail",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeKeeper",
      "discriminator": [
        193,
        167,
        169,
        215,
        44,
        36,
        88,
        247
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "providerRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "keeper",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "removeLocation",
      "discriminator": [
        85,
        2,
        35,
        12,
        215,
        19,
        137,
        25
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "location"
              }
            ]
          }
        },
        {
          "name": "providerMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "location"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        },
        {
          "name": "location",
          "type": "pubkey"
        },
        {
          "name": "deviceId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "updateCampaignPerformance",
      "discriminator": [
        197,
        49,
        129,
        45,
        219,
        139,
        237,
        225
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign.authority",
                "account": "campaign"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "providerRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "deviceFeed",
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
                "path": "deviceId"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                14,
                38,
                213,
                253,
                168,
                202,
                68,
                88,
                217,
                77,
                5,
                51,
                39,
                117,
                252,
                224,
                34,
                135,
                49,
                219,
                151,
                201,
                41,
                153,
                252,
                159,
                241,
                27,
                192,
                195,
                94,
                255
              ]
            }
          }
        },
        {
          "name": "oracleProgram",
          "address": "xF4A8Ksy6WSzJpskfiVUit4osedmBorP3bgDe9uKu2e"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        },
        {
          "name": "deviceId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "updateProvider",
      "discriminator": [
        52,
        208,
        141,
        191,
        164,
        54,
        108,
        150
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "adProvider"
          ]
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "providerMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "location",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "contactEmail",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "isActive",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "withdrawEarnings",
      "discriminator": [
        6,
        132,
        233,
        254,
        241,
        87,
        247,
        185
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "adProvider"
          ]
        },
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "campaign.authority",
                "account": "campaign"
              },
              {
                "kind": "arg",
                "path": "campaignId"
              }
            ]
          }
        },
        {
          "name": "adProvider",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  95,
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "adProvider",
      "discriminator": [
        69,
        236,
        248,
        123,
        232,
        16,
        180,
        43
      ]
    },
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
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
    },
    {
      "name": "providerMetadata",
      "discriminator": [
        235,
        154,
        61,
        218,
        139,
        14,
        188,
        206
      ]
    },
    {
      "name": "providerRegistry",
      "discriminator": [
        27,
        101,
        68,
        38,
        206,
        197,
        61,
        114
      ]
    }
  ],
  "events": [
    {
      "name": "budgetAdded",
      "discriminator": [
        227,
        8,
        82,
        112,
        239,
        227,
        92,
        169
      ]
    },
    {
      "name": "campaignCompleted",
      "discriminator": [
        114,
        100,
        117,
        191,
        22,
        109,
        23,
        132
      ]
    },
    {
      "name": "campaignCreated",
      "discriminator": [
        9,
        98,
        69,
        61,
        53,
        131,
        64,
        152
      ]
    },
    {
      "name": "deviceOrdered",
      "discriminator": [
        99,
        22,
        157,
        161,
        130,
        197,
        6,
        100
      ]
    },
    {
      "name": "earningsWithdrawn",
      "discriminator": [
        2,
        155,
        160,
        28,
        85,
        112,
        127,
        79
      ]
    },
    {
      "name": "feesCalculated",
      "discriminator": [
        224,
        2,
        105,
        119,
        225,
        171,
        26,
        89
      ]
    },
    {
      "name": "locationAdded",
      "discriminator": [
        19,
        56,
        80,
        30,
        71,
        86,
        61,
        13
      ]
    },
    {
      "name": "locationRemoved",
      "discriminator": [
        204,
        145,
        67,
        119,
        176,
        137,
        100,
        59
      ]
    },
    {
      "name": "performanceUpdated",
      "discriminator": [
        53,
        184,
        221,
        195,
        192,
        50,
        181,
        79
      ]
    },
    {
      "name": "providerMetadataUpdated",
      "discriminator": [
        156,
        94,
        247,
        112,
        106,
        223,
        215,
        99
      ]
    },
    {
      "name": "providerRegistered",
      "discriminator": [
        38,
        209,
        137,
        78,
        185,
        19,
        147,
        14
      ]
    },
    {
      "name": "registryInitialized",
      "discriminator": [
        144,
        138,
        62,
        105,
        58,
        38,
        100,
        177
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "deviceNotFound",
      "msg": "Device not found"
    },
    {
      "code": 6001,
      "name": "deviceNotAvailable",
      "msg": "Device not available"
    },
    {
      "code": 6002,
      "name": "deviceNotBooked",
      "msg": "Device not booked"
    },
    {
      "code": 6003,
      "name": "registryNotInitialized",
      "msg": "Provider registry not initialized"
    },
    {
      "code": 6004,
      "name": "providerNotInRegistry",
      "msg": "Provider not found in registry"
    },
    {
      "code": 6005,
      "name": "registryFull",
      "msg": "Registry is full, cannot add more providers"
    },
    {
      "code": 6006,
      "name": "calculationError",
      "msg": "Calculation error"
    },
    {
      "code": 6007,
      "name": "insufficientBudget",
      "msg": "Insufficient budget"
    },
    {
      "code": 6008,
      "name": "noViews",
      "msg": "No views recorded"
    },
    {
      "code": 6009,
      "name": "campaignNotCompleted",
      "msg": "Campaign not completed"
    },
    {
      "code": 6010,
      "name": "campaignNotActive",
      "msg": "Campaign not active"
    },
    {
      "code": 6011,
      "name": "providerNotInCampaign",
      "msg": "Provider not in campaign"
    },
    {
      "code": 6012,
      "name": "noEarningsToWithdraw",
      "msg": "No earnings to withdraw"
    },
    {
      "code": 6013,
      "name": "unauthorized",
      "msg": "Unauthorized: Only deployer or keepers can perform this action"
    }
  ],
  "types": [
    {
      "name": "adProvider",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "devices",
            "type": {
              "vec": {
                "defined": {
                  "name": "soulboard"
                }
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "contactEmail",
            "type": "string"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "totalCampaigns",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "totalEarnings",
            "type": "u64"
          },
          {
            "name": "pendingPayments",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "budgetAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "campaignName",
            "type": "string"
          },
          {
            "name": "campaignDescription",
            "type": "string"
          },
          {
            "name": "campaignBudget",
            "type": "u64"
          },
          {
            "name": "campaignStatus",
            "type": {
              "defined": {
                "name": "campaignStatus"
              }
            }
          },
          {
            "name": "campaignProviders",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "campaignLocations",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "runningDays",
            "type": "u32"
          },
          {
            "name": "hoursPerDay",
            "type": "u32"
          },
          {
            "name": "baseFeePerHour",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "totalDistributed",
            "type": "u64"
          },
          {
            "name": "campaignPerformance",
            "type": {
              "vec": {
                "defined": {
                  "name": "providerPerformance"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "campaignCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "campaignCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "campaignStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "paused"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
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
      "name": "deviceOrdered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deviceId",
            "type": "u32"
          },
          {
            "name": "deviceState",
            "type": {
              "defined": {
                "name": "deviceState"
              }
            }
          }
        ]
      }
    },
    {
      "name": "deviceState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "available"
          },
          {
            "name": "booked"
          },
          {
            "name": "ordered"
          },
          {
            "name": "paused"
          }
        ]
      }
    },
    {
      "name": "earningsWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feesCalculated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "totalDistributed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "locationAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "location",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "locationRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "location",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "performanceUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaignId",
            "type": "u32"
          },
          {
            "name": "deviceId",
            "type": "u32"
          },
          {
            "name": "totalViews",
            "type": "u64"
          },
          {
            "name": "totalTaps",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "providerMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "providerPda",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "deviceCount",
            "type": "u32"
          },
          {
            "name": "availableDevices",
            "type": "u32"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "providerMetadataUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "availableDevices",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "providerPerformance",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "deviceId",
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
            "name": "calculatedEarnings",
            "type": "u64"
          },
          {
            "name": "baseFeeEarned",
            "type": "u64"
          },
          {
            "name": "performanceFeeEarned",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "providerRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "providerRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deployer",
            "type": "pubkey"
          },
          {
            "name": "totalProviders",
            "type": "u32"
          },
          {
            "name": "providers",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "keepers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "registryInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "registry",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "soulboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deviceId",
            "type": "u32"
          },
          {
            "name": "deviceState",
            "type": {
              "defined": {
                "name": "deviceState"
              }
            }
          }
        ]
      }
    }
  ]
};
