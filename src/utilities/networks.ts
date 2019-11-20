/**
 * Config for bitcoin like networks.
 *
 * paymentTypes sourced from: https://github.com/satoshilabs/slips/blob/master/slip-0132.md
 * bip44Path sourced from: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */
import coininfo from 'coininfo'
import { Network as BitcoinJsNetwork } from 'bitcoinjs-lib'
import { pick } from 'lodash'

import { FeeRate } from 'Types'

export type AddressEncoding = 'P2PKH' | 'P2SH-P2WPKH' | 'P2WPKH' | 'P2SH-P2WSH' | 'P2WSH'

export type PaymentType = {
  addressEncoding: AddressEncoding,
  bip44Path: string[] | string | null,
  bip32: {
    public: number,
    publicPrefix: string,
    private: number,
    privatePrefix: string,
  },
}

type BaseNetworkConfig = {
  symbol: string,
  name: string,
  bitcoreUrls: string[],
  minTxFee?: FeeRate,
  dustThreshold?: number,
  paymentTypes: PaymentType[],
}

export type NetworkConfig = BaseNetworkConfig & {
  bitcoinJsNetwork: BitcoinJsNetwork,
}

type StaticNetworkConfig = BaseNetworkConfig & {
  bitcoinJsNetwork?: Partial<BitcoinJsNetwork>,
}

function network(config: StaticNetworkConfig): NetworkConfig {
  const { symbol, bitcoinJsNetwork } = config
  const coinInfo = coininfo(symbol)
  if (!coinInfo) {
    throw new Error(`Cannot get coininfo for ${symbol}`)
  }
  return {
    ...config,
    bitcoinJsNetwork: {
      // Base config
      ...pick(coinInfo.toBitcoinJS(), 'bech32', 'bip32', 'messagePrefix', 'pubKeyHash', 'scriptHash', 'wif'),
      // Overrides
      ...(bitcoinJsNetwork || {}),
    },
  }
}

export const BTC = network({
  symbol: 'BTC',
  name: 'Bitcoin',
  bitcoreUrls: [
    'https://btc1.trezor.io',
    'https://btc2.trezor.io',
    'https://btc3.trezor.io',
    'https://btc4.trezor.io',
    'https://btc5.trezor.io',
    // 'https://blockexplorer.com', // not segwit compatible
  ],
  minTxFee: {
    rate: 1,
    unit: 'sat/byte',
  },
  dustThreshold: 546,
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/0'",
      bip32: {
        public: 0x0488b21e,
        publicPrefix: 'xpub',
        private: 0x0488ade4,
        privatePrefix: 'xprv',
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/0'",
      bip32: {
        public: 0x049d7cb2,
        publicPrefix: 'ypub',
        private: 0x049d7878,
        privatePrefix: 'yprv',
      },
    },
    {
      addressEncoding: 'P2WPKH',
      bip44Path: "m/84'/0'",
      bip32: {
        public: 0x04b24746,
        publicPrefix: 'zpub',
        private: 0x04b2430c,
        privatePrefix: 'zprv',
      },
    },
    {
      addressEncoding: 'P2SH-P2WSH',
      bip44Path: null,
      bip32: {
        public: 0x0295b43f,
        publicPrefix: 'Ypub',
        private: 0x0295b005,
        privatePrefix: 'Yprv',
      },
    },
    {
      addressEncoding: 'P2WSH',
      bip44Path: null,
      bip32: {
        public: 0x02aa7ed3,
        publicPrefix: 'Zpub',
        private: 0x02aa7a99,
        privatePrefix: 'Zprv',
      },
    },
  ],
})

export const BTC_TEST = network({
  symbol: 'BTC-TEST',
  name: 'Bitcoin Testnet',
  bitcoreUrls: [],
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/1'",
      bip32: {
        public: 0x043587cf,
        publicPrefix: 'tpub',
        private: 0x04358394,
        privatePrefix: 'tprv',
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/1'",
      bip32: {
        public: 0x044a5262,
        publicPrefix: 'upub',
        private: 0x044a4e28,
        privatePrefix: 'uprv',
      },
    },
    {
      addressEncoding: 'P2SH-P2WSH',
      bip44Path: null,
      bip32: {
        public: 0x024289ef,
        publicPrefix: 'Upub',
        private: 0x024285b5,
        privatePrefix: 'Uprv',
      },
    },
    {
      addressEncoding: 'P2WPKH',
      bip44Path: "m/84'/1'",
      bip32: {
        public: 0x045f1cf6,
        publicPrefix: 'vpub',
        private: 0x045f18bc,
        privatePrefix: 'vprv',
      },
    },
    {
      addressEncoding: 'P2WSH',
      bip44Path: null,
      bip32: {
        public: 0x02575483,
        publicPrefix: 'Vpub',
        private: 0x02575048,
        privatePrefix: 'Vprv',
      },
    },
  ],
})

export const BCH = network({
  symbol: 'BCH',
  name: 'Bitcoin Cash',
  bitcoreUrls: [
    'https://bch1.trezor.io',
    'https://bch2.trezor.io',
    'https://bch3.trezor.io',
    'https://bch4.trezor.io',
    'https://bch5.trezor.io',
    'https://bch-insight.bitpay.com',
    // 'https://bitcoincash.blockexplorer.com', // not bchabc compatible
  ],
  minTxFee: {
    rate: 1,
    unit: 'sat/byte',
  },
  dustThreshold: 546,
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: ["m/44'/145'", "m/44'/0'"],
      bip32: {
        public: 0x0488b21e,
        publicPrefix: 'xpub',
        private: 0x0488ade4,
        privatePrefix: 'xprv',
      },
    },
  ],
})

export const LTC = network({
  symbol: 'LTC',
  name: 'Litecoin',
  bitcoreUrls: [
    'https://ltc1.trezor.io',
    'https://ltc2.trezor.io',
    'https://ltc3.trezor.io',
    'https://ltc4.trezor.io',
    'https://ltc5.trezor.io',
    'https://insight.litecore.io',
  ],
  minTxFee: {
    rate: 10,
    unit: 'sat/byte',
  },
  dustThreshold: 546,
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/2'",
      bip32: {
        public: 0x019da462,
        publicPrefix: 'Ltub',
        private: 0x019d9cfe,
        privatePrefix: 'Ltpv',
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/2'",
      bip32: {
        public: 0x01b26ef6,
        publicPrefix: 'Mtub',
        private: 0x01b26792,
        privatePrefix: 'Mtpv',
      },
    },
  ],
})

export const LTC_TEST = network({
  symbol: 'LTC-TEST',
  name: 'Litecoin Testnet',
  bitcoreUrls: [],
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/1'",
      bip32: {
        public: 0x0436f6e1,
        publicPrefix: 'ttub',
        private: 0x0436ef7d,
        privatePrefix: 'ttpv',
      },
    },
  ],
})

export const VTC = network({
  symbol: 'VTC',
  name: 'Vertcoin',
  bitcoreUrls: [
    'https://vtc1.trezor.io',
    'https://vtc2.trezor.io',
    'https://vtc3.trezor.io',
    'https://vtc4.trezor.io',
    'https://vtc5.trezor.io',
  ],
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/28'",
      bip32: {
        public: 0x0488b21e,
        publicPrefix: 'vtcp',
        private: 0x0488ade4,
        privatePrefix: 'vtcv',
      },
    },
  ],
})


const allConfigs: { [symbol: string]: NetworkConfig } = {
  BTC,
  BTC_TEST,
  BCH,
  LTC,
  LTC_TEST,
  VTC,
}

export default allConfigs
