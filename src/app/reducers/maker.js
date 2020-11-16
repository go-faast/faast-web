import { createReducer } from 'redux-act'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateMakerId, updateSecretKey, resetMaker, logout, updateProfile,
  swapsLoading, makerDataUpdated, swapHistoryTotalUpdated, loadingData,
  updateBalances
} from 'Actions/maker'

const profile = {
  isOnline: true,
  isSuspended: false,
  isBlocked: false,
  assetsEnabled: [],
  reputationGrade: 'B',
  swapsInProgress: -3,
  swapsCompleted: 11524,
  capacityAddress: '',
  capacityMaximumBtc: 0,
  capacityAvailableBtc: 0,
  volumeOutstandingBtc: -0.5330140900000313,
  volumeOutstandingUsd: -5699.870000000046,
  balances: [
    {
      asset: 'BAT',
      exchange: 586.95672707,
      exchangeBtc: 0.01198566,
      exchangeUsd: 124.75,
      wallet: 1125.81168318,
      walletBtc: 0.02298907,
      walletUsd: 239.27,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'BCH',
      exchange: 0.21074807,
      exchangeBtc: 0.00432371,
      exchangeUsd: 45,
      wallet: 0.10344161,
      walletBtc: 0.00212221,
      walletUsd: 22.09,
      hotwalletAddress: 'bitcoincash:qrreuqa3r40fcg6lj4h6qeuzn2xttw6ua5s467pg58'
    },
    {
      asset: 'BNB',
      exchange: 40.43372631,
      exchangeBtc: 0.0906605,
      exchangeUsd: 943.59,
      wallet: 0,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'BTC',
      exchange: 1.74949875,
      exchangeBtc: 1.74949875,
      exchangeUsd: 18208.64,
      wallet: 0.0764495,
      walletBtc: 0.0764495,
      walletUsd: 795.68,
      hotwalletAddress: 'bc1qnalyjn30mkkfhdrfxgj64qu27rlhfck5h4z59q'
    },
    {
      asset: 'BUSD',
      exchange: 52.52008835,
      exchangeBtc: 0.00504666,
      exchangeUsd: 52.52,
      wallet: 46.74871199,
      walletBtc: 0.00449208,
      walletUsd: 46.75,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'COMP',
      exchange: 0.49072147,
      exchangeBtc: 0.00613353,
      exchangeUsd: 63.84,
      wallet: 0.20539569,
      walletBtc: 0.00256724,
      walletUsd: 26.72,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'DAI',
      exchange: 632.28842143,
      exchangeBtc: 0.0614774,
      exchangeUsd: 639.85,
      wallet: 128.542299,
      walletBtc: 0.01249817,
      walletUsd: 130.08,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'EDR',
      exchange: 0,
      exchangeBtc: 0,
      exchangeUsd: 0,
      wallet: 0,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'ENJ',
      exchange: 27.61511761,
      exchangeBtc: 0.00037667,
      exchangeUsd: 3.92,
      wallet: 91.33831792,
      walletBtc: 0.00124585,
      walletUsd: 12.97,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'ETH',
      exchange: 1.96456394,
      exchangeBtc: 0.06453985,
      exchangeUsd: 671.73,
      wallet: 3.504613310031509,
      walletBtc: 0.11513356,
      walletUsd: 1198.3,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'FUN',
      exchange: 19379.12002782,
      exchangeBtc: 0.00561994,
      exchangeUsd: 58.49,
      wallet: 41.76111111,
      walletBtc: 0.00001211,
      walletUsd: 0.13,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'GNT',
      exchange: 704.22594436,
      exchangeBtc: 0.00611972,
      exchangeUsd: 63.69,
      wallet: 911.44201884,
      walletBtc: 0.00792043,
      walletUsd: 82.44,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'LINK',
      exchange: 64.11568779,
      exchangeBtc: 0.05351736,
      exchangeUsd: 557,
      wallet: 29.29093854,
      walletBtc: 0.02444915,
      walletUsd: 254.46,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'LOOM',
      exchange: 2927.77552356,
      exchangeBtc: 0.00591411,
      exchangeUsd: 61.55,
      wallet: 1662.4185548,
      walletBtc: 0.00335809,
      walletUsd: 34.95,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'LTC',
      exchange: 0.45159471,
      exchangeBtc: 0.00187999,
      exchangeUsd: 19.57,
      wallet: 2.89243299,
      walletBtc: 0.0120412,
      walletUsd: 125.32,
      hotwalletAddress: 'ltc1qxlept976eh6n23x32kvwt8hdfeu4s5hy2gf2y8'
    },
    {
      asset: 'LUN',
      exchange: 14.90074837,
      exchangeBtc: 0,
      exchangeUsd: 0,
      wallet: 6.30621687,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'MANA',
      exchange: 102.85211665,
      exchangeBtc: 0.00068088,
      exchangeUsd: 7.09,
      wallet: 900.91027857,
      walletBtc: 0.00596403,
      walletUsd: 62.07,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'MTL',
      exchange: 0.31745617,
      exchangeBtc: 0.00000876,
      exchangeUsd: 0.09,
      wallet: 0,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'PAX',
      exchange: 155.00020681,
      exchangeBtc: 0.01490637,
      exchangeUsd: 155,
      wallet: 13.91189632,
      walletBtc: 0.00133791,
      walletUsd: 13.91,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'POLY',
      exchange: 163.10345371,
      exchangeBtc: 0.00057086,
      exchangeUsd: 5.94,
      wallet: 2186.4152501,
      walletBtc: 0.00765245,
      walletUsd: 79.65,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'SNGLS',
      exchange: 0,
      exchangeBtc: 0,
      exchangeUsd: 0,
      wallet: 0,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'TRX',
      exchange: 14417.85297443,
      exchangeBtc: 0.03445867,
      exchangeUsd: 358.64,
      wallet: 8254.586733,
      walletBtc: 0.01972846,
      walletUsd: 205.33,
      hotwalletAddress: 'TMLMgUj43S8wd1PpD1eN7bpHrYrDX8b4cP'
    },
    {
      asset: 'TUSD',
      exchange: 61.16825375,
      exchangeBtc: 0.00587949,
      exchangeUsd: 61.17,
      wallet: 108.57963193,
      walletBtc: 0.01043667,
      walletUsd: 108.58,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'UKG',
      exchange: 0,
      exchangeBtc: 0,
      exchangeUsd: 0,
      wallet: 0,
      walletBtc: 0,
      walletUsd: 0,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'USDC',
      exchange: 1946.84019353,
      exchangeBtc: 0.18714975,
      exchangeUsd: 1946.84,
      wallet: 3710.462717,
      walletBtc: 0.35668678,
      walletUsd: 3710.46,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'USDT',
      exchange: 1609.41088522,
      exchangeBtc: 0.15456782,
      exchangeUsd: 1609.41,
      wallet: 2578.500309,
      walletBtc: 0.24763917,
      walletUsd: 2578.5,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    },
    {
      asset: 'XLM',
      exchange: 15244.9533971,
      exchangeBtc: 0.10351323,
      exchangeUsd: 1077.36,
      wallet: 172.1810815,
      walletBtc: 0.00116911,
      walletUsd: 12.17,
      hotwalletAddress: 'GAJNPOE55I3437F5QEJTYFLO7SY2PI7TPHJX5U4RIGT4FBS3XV7RIT7O'
    },
    {
      asset: 'XRP',
      exchange: 1800.747712,
      exchangeBtc: 0.03992258,
      exchangeUsd: 415.51,
      wallet: 19.480763,
      walletBtc: 0.00043189,
      walletUsd: 4.5,
      hotwalletAddress: 'rsAPSkiRgC5ZJg9agR4xvqY9pgCRop7zRz'
    },
    {
      asset: 'ZRX',
      exchange: 311.30337193,
      exchangeBtc: 0.01102325,
      exchangeUsd: 114.73,
      wallet: 221.48226786,
      walletBtc: 0.00784269,
      walletUsd: 81.63,
      hotwalletAddress: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
    }
  ],
  erc20PayportsAvailable: 0,
  erc20PayportPoolSize: 10,
  warnings: [
    'Wallet balance for BNB is too low: 0'
  ],
  _id: '5eaacf28f76e111069a7054d',
  createdAt: '2020-04-30T13:12:37.113Z',
  makerId: 'satoshiNakamoetoe',
  publicName: 'Faast MMSN',
  lastSeenAt: '2020-09-21T18:16:00.382Z',
  contactEmail: 'moeadham@gmail.com',
  lastSwapCompletedAt: '2020-09-21T16:07:32.978Z',
  lastSwapCreatedAt: '2020-09-21T18:02:42.319Z',
  llamaClientVersion: '1.4.0',
  approxTotalBalances: {
    total: {
      BTC: 3.56394333,
      USD: 37091.88
    },
    wallet: {
      BTC: 0.94416782,
      USD: 9825.96
    },
    exchange: {
      BTC: 2.61977551,
      USD: 27265.92
    },
    timestamp: 1600712160382
  },
  detailedStatus: {
    exchangeDepositAddresses: {
      BTC: {
        address: '1LcUj5TtKREfnD1xH6vWvs3Vp6JaeSJf61',
        extraId: null
      },
      TRX: {
        address: 'TS73gQZrFWSvkMMgXA8ySgzJx8rjTATntW',
        extraId: null
      },
      XRP: {
        address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
        extraId: '104882119'
      },
      XLM: {
        address: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
        extraId: '1045508413'
      },
      ETH: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      BAT: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      BUSD: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      ENJ: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      FUN: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      GNT: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      LINK: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      LOOM: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      LUN: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      MANA: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      MTL: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      PAX: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      POLY: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      SNGLS: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      TUSD: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      USDC: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      USDT: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      ZRX: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      COMP: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      },
      LTC: {
        address: 'LXe7uPVmtobPq8R5CwbZotC5Yt18JXLyu8',
        extraId: null
      },
      BCH: {
        address: 'bitcoincash:qrtjq9a4zkrd6jv9wc5st0qdtczxpjplauxhfnp6dg',
        extraId: null
      },
      DAI: {
        address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
        extraId: null
      }
    },
    balances: {
      wallet: {
        BAT: {
          assetSymbol: 'BAT',
          networkType: 'mainnet',
          confirmedBalance: '1125.81168318',
          unconfirmedBalance: '0',
          spendableBalance: '1125.81168318',
          pendingSpent: '0',
          availableBalance: '1125.81168318',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        BCH: {
          assetSymbol: 'BCH',
          networkType: 'mainnet',
          confirmedBalance: '0.10344161',
          unconfirmedBalance: '0',
          minimumBalance: '0',
          spendableBalance: '0.10344161',
          pendingSpent: '0',
          availableBalance: '0.10344161',
          sweepable: true,
          requiresActivation: false,
          address: 'bitcoincash:qrreuqa3r40fcg6lj4h6qeuzn2xttw6ua5s467pg58'
        },
        BNB: {
          assetSymbol: 'BNB',
          networkType: 'mainnet',
          confirmedBalance: '0',
          unconfirmedBalance: '0',
          spendableBalance: '0',
          pendingSpent: '0',
          availableBalance: '0',
          sweepable: false,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        BTC: {
          assetSymbol: 'BTC',
          networkType: 'mainnet',
          confirmedBalance: '0.0764495',
          unconfirmedBalance: '0.58600142',
          minimumBalance: '0',
          spendableBalance: '0.0764495',
          pendingSpent: '0',
          availableBalance: '0.0764495',
          sweepable: true,
          requiresActivation: false,
          address: 'bc1qnalyjn30mkkfhdrfxgj64qu27rlhfck5h4z59q'
        },
        BUSD: {
          assetSymbol: 'BUSD',
          networkType: 'mainnet',
          confirmedBalance: '46.74871199',
          unconfirmedBalance: '0',
          spendableBalance: '46.74871199',
          pendingSpent: '0',
          availableBalance: '46.74871199',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        COMP: {
          assetSymbol: 'COMP',
          networkType: 'mainnet',
          confirmedBalance: '0.20539569',
          unconfirmedBalance: '0',
          spendableBalance: '0.20539569',
          pendingSpent: '0',
          availableBalance: '0.20539569',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        DAI: {
          assetSymbol: 'DAI',
          networkType: 'mainnet',
          confirmedBalance: '128.542299',
          unconfirmedBalance: '0',
          spendableBalance: '128.542299',
          pendingSpent: '0',
          availableBalance: '128.542299',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        EDR: {
          assetSymbol: 'EDR',
          networkType: 'mainnet',
          confirmedBalance: '0',
          unconfirmedBalance: '0',
          spendableBalance: '0',
          pendingSpent: '0',
          availableBalance: '0',
          sweepable: false,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        ENJ: {
          assetSymbol: 'ENJ',
          networkType: 'mainnet',
          confirmedBalance: '91.33831792',
          unconfirmedBalance: '0',
          spendableBalance: '91.33831792',
          pendingSpent: '0',
          availableBalance: '91.33831792',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        ETH: {
          assetSymbol: 'ETH',
          networkType: 'mainnet',
          confirmedBalance: '3.504613310031509002',
          unconfirmedBalance: '0',
          spendableBalance: '3.504613310031509002',
          pendingSpent: '0',
          availableBalance: '3.504613310031509002',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        FUN: {
          assetSymbol: 'FUN',
          networkType: 'mainnet',
          confirmedBalance: '41.76111111',
          unconfirmedBalance: '0',
          spendableBalance: '41.76111111',
          pendingSpent: '0',
          availableBalance: '41.76111111',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        GNT: {
          assetSymbol: 'GNT',
          networkType: 'mainnet',
          confirmedBalance: '911.44201884',
          unconfirmedBalance: '0',
          spendableBalance: '911.44201884',
          pendingSpent: '0',
          availableBalance: '911.44201884',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        LINK: {
          assetSymbol: 'LINK',
          networkType: 'mainnet',
          confirmedBalance: '29.29093854',
          unconfirmedBalance: '0',
          spendableBalance: '29.29093854',
          pendingSpent: '0',
          availableBalance: '29.29093854',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        LOOM: {
          assetSymbol: 'LOOM',
          networkType: 'mainnet',
          confirmedBalance: '1662.4185548',
          unconfirmedBalance: '0',
          spendableBalance: '1662.4185548',
          pendingSpent: '0',
          availableBalance: '1662.4185548',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        LTC: {
          assetSymbol: 'LTC',
          networkType: 'mainnet',
          confirmedBalance: '2.89243299',
          unconfirmedBalance: '0',
          minimumBalance: '0',
          spendableBalance: '2.89243299',
          pendingSpent: '0',
          availableBalance: '2.89243299',
          sweepable: true,
          requiresActivation: false,
          address: 'ltc1qxlept976eh6n23x32kvwt8hdfeu4s5hy2gf2y8'
        },
        LUN: {
          assetSymbol: 'LUN',
          networkType: 'mainnet',
          confirmedBalance: '6.30621687',
          unconfirmedBalance: '0',
          spendableBalance: '6.30621687',
          pendingSpent: '0',
          availableBalance: '6.30621687',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        MANA: {
          assetSymbol: 'MANA',
          networkType: 'mainnet',
          confirmedBalance: '900.91027857',
          unconfirmedBalance: '0',
          spendableBalance: '900.91027857',
          pendingSpent: '0',
          availableBalance: '900.91027857',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        MTL: {
          assetSymbol: 'MTL',
          networkType: 'mainnet',
          confirmedBalance: '0',
          unconfirmedBalance: '0',
          spendableBalance: '0',
          pendingSpent: '0',
          availableBalance: '0',
          sweepable: false,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        PAX: {
          assetSymbol: 'PAX',
          networkType: 'mainnet',
          confirmedBalance: '13.91189632',
          unconfirmedBalance: '0',
          spendableBalance: '13.91189632',
          pendingSpent: '0',
          availableBalance: '13.91189632',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        POLY: {
          assetSymbol: 'POLY',
          networkType: 'mainnet',
          confirmedBalance: '2186.4152501',
          unconfirmedBalance: '0',
          spendableBalance: '2186.4152501',
          pendingSpent: '0',
          availableBalance: '2186.4152501',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        SNGLS: {
          assetSymbol: 'SNGLS',
          networkType: 'mainnet',
          confirmedBalance: '0',
          unconfirmedBalance: '0',
          spendableBalance: '0',
          pendingSpent: '0',
          availableBalance: '0',
          sweepable: false,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        TRX: {
          assetSymbol: 'TRX',
          networkType: 'mainnet',
          confirmedBalance: '8254.686733',
          unconfirmedBalance: '0',
          minimumBalance: '0.1',
          spendableBalance: '8254.586733',
          pendingSpent: '0',
          availableBalance: '8254.586733',
          sweepable: true,
          requiresActivation: false,
          address: 'TMLMgUj43S8wd1PpD1eN7bpHrYrDX8b4cP'
        },
        TUSD: {
          assetSymbol: 'TUSD',
          networkType: 'mainnet',
          confirmedBalance: '108.57963193',
          unconfirmedBalance: '0',
          spendableBalance: '108.57963193',
          pendingSpent: '0',
          availableBalance: '108.57963193',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        UKG: {
          assetSymbol: 'UKG',
          networkType: 'mainnet',
          confirmedBalance: '0',
          unconfirmedBalance: '0',
          spendableBalance: '0',
          pendingSpent: '0',
          availableBalance: '0',
          sweepable: false,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        USDC: {
          assetSymbol: 'USDC',
          networkType: 'mainnet',
          confirmedBalance: '3710.462717',
          unconfirmedBalance: '0',
          spendableBalance: '3710.462717',
          pendingSpent: '0',
          availableBalance: '3710.462717',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        USDT: {
          assetSymbol: 'USDT',
          networkType: 'mainnet',
          confirmedBalance: '2578.500309',
          unconfirmedBalance: '0',
          spendableBalance: '2578.500309',
          pendingSpent: '0',
          availableBalance: '2578.500309',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        },
        XLM: {
          assetSymbol: 'XLM',
          networkType: 'mainnet',
          confirmedBalance: '173.1810815',
          unconfirmedBalance: '0',
          minimumBalance: '1',
          spendableBalance: '172.1810815',
          pendingSpent: '0',
          availableBalance: '172.1810815',
          sweepable: true,
          requiresActivation: false,
          address: 'GAJNPOE55I3437F5QEJTYFLO7SY2PI7TPHJX5U4RIGT4FBS3XV7RIT7O'
        },
        XRP: {
          assetSymbol: 'XRP',
          networkType: 'mainnet',
          confirmedBalance: '39.480763',
          unconfirmedBalance: '0',
          minimumBalance: '20',
          spendableBalance: '19.480763',
          pendingSpent: '0',
          availableBalance: '19.480763',
          sweepable: true,
          requiresActivation: false,
          address: 'rsAPSkiRgC5ZJg9agR4xvqY9pgCRop7zRz'
        },
        ZRX: {
          assetSymbol: 'ZRX',
          networkType: 'mainnet',
          confirmedBalance: '221.48226786',
          unconfirmedBalance: '0',
          spendableBalance: '221.48226786',
          pendingSpent: '0',
          availableBalance: '221.48226786',
          sweepable: true,
          requiresActivation: false,
          address: '0xc633fdadd08048bb8dc4dfbf584fbf8f94e67a42'
        }
      },
      exchange: {
        BAT: 586.95672707,
        BCH: 0.21074807,
        BNB: 40.43372631,
        BTC: 1.74949875,
        BUSD: 52.52008835,
        COMP: 0.49072147,
        DAI: 632.28842143,
        EDR: 0,
        ENJ: 27.61511761,
        ETH: 1.96456394,
        FUN: 19379.12002782,
        GNT: 704.22594436,
        LINK: 64.11568779,
        LOOM: 2927.77552356,
        LTC: 0.45159471,
        LUN: 14.90074837,
        MANA: 102.85211665,
        MTL: 0.31745617,
        PAX: 155.00020681,
        POLY: 163.10345371,
        SNGLS: 0,
        TRX: 14417.85297443,
        TUSD: 61.16825375,
        UKG: 0,
        USDC: 1946.84019353,
        USDT: 1609.41088522,
        XLM: 15244.9533971,
        XRP: 1800.747712,
        ZRX: 311.30337193
      }
    }
  },
  exchangeDepositAddresses: {
    BTC: {
      address: '1LcUj5TtKREfnD1xH6vWvs3Vp6JaeSJf61',
      extraId: null
    },
    TRX: {
      address: 'TS73gQZrFWSvkMMgXA8ySgzJx8rjTATntW',
      extraId: null
    },
    XRP: {
      address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
      extraId: '104882119'
    },
    XLM: {
      address: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
      extraId: '1045508413'
    },
    ETH: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    BAT: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    BUSD: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    ENJ: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    FUN: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    GNT: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    LINK: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    LOOM: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    LUN: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    MANA: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    MTL: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    PAX: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    POLY: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    SNGLS: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    TUSD: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    USDC: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    USDT: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    ZRX: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    COMP: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    },
    LTC: {
      address: 'LXe7uPVmtobPq8R5CwbZotC5Yt18JXLyu8',
      extraId: null
    },
    BCH: {
      address: 'bitcoincash:qrtjq9a4zkrd6jv9wc5st0qdtczxpjplauxhfnp6dg',
      extraId: null
    },
    DAI: {
      address: '0x43b9f9eaf7259cdfbd3158d8b5d6576245946a9c',
      extraId: null
    }
  },
  lastSwapProcessedAt: '2020-09-21T18:12:14.884Z'
}

const initialState = {
  lastUpdated: undefined,
  balances: profile.balances,
  loggedIn: false,
  loadingData: false,
  profile,
  swapCount: undefined,
  maker_id: '',
  loginError: false,
  swapsError: '',
  swapsLoading: false,
  statsError: '',
  stats: {},
  swaps: {},
}

export default createReducer({
  [login]: (state) => ({ ...state, loggedIn: true, loginError: false, loadingLogin: false }),
  [loadingData]: (state, loadingData) => ({ ...state, loadingData }),
  [logout]: (state) => ({ ...state, loggedIn: false, loginError: false }),
  [loginError]: (state) => ({ ...state, loggedIn: false, loginError: true, loadingLogin: false }),
  [updateMakerId]: (state, id) => ({ ...state, affiliate_id: id }),
  [updateProfile]: (state, profile) => ({ ...state, profile }),
  [updateBalances]: (state, balances) => ({ ...state, balances }),
  [makerDataUpdated]: (state, timestamp = Date.now()) => ({ ...state, lastUpdated: timestamp }),
  [statsRetrieved]: (state, stats) => ({ 
    ...state,
    statsError: '',
    stats: { ...stats },
  }),
  [statsError]: (state, error) => ({ ...state, statsError: error }),
  [swapsLoading]: (state) => ({ ...state, swapsLoading: true }),
  [swapsRetrieved]: (state, swaps) => ({ 
    ...state,
    swaps: { ...swaps },
    swapsError: '',
    swapsLoading: false,
  }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error, swapsLoading: false }),
  [resetMaker]: () => initialState
}, initialState)
