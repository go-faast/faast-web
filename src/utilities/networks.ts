/**
 * Config for bitcoin like networks.
 *
 * paymentTypes sourced from: https://github.com/satoshilabs/slips/blob/master/slip-0132.md
 */
import coininfo from 'coininfo'
import { Network as BitcoinJsNetwork } from 'bitcoinjs-lib'
import { pick } from 'lodash'

export type AddressEncoding = 'P2PKH' | 'P2SH-P2WPKH' | 'P2WPKH' | 'P2SH-P2WSH' | 'P2WSH'

export type PaymentType = {
  addressEncoding: AddressEncoding,
  bip44Path: string | null,
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
  return {
    ...config,
    bitcoinJsNetwork: {
      // Base config
      ...pick(coininfo(symbol).toBitcoinJS(), 'bech32', 'bip32', 'messagePrefix', 'pubKeyHash', 'scriptHash', 'wif'),
      // Overrides
      ...(bitcoinJsNetwork || {}),
    },
  }
}

const addressEncoders = {
  // 'P2PKH': (pubkey: Buffer, network: NetworkConfig) => bitcoin.payments.p2pkh({ pubkey, network }).address,
}

export const BTC = network({
  symbol: 'BTC',
  name: 'Bitcoin',
  bitcoreUrls: [
    'https://btc.faa.st', 'https://blockexplorer.com',
    'https://bitcore1.trezor.io', 'https://bitcore3.trezor.io',
  ],
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

export const LTC = network({
  symbol: 'LTC',
  name: 'Litecoin',
  bitcoreUrls: ['https://ltc-bitcore3.trezor.io'],
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
      bip44Path: "m/49'/1'",
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
  bitcoreUrls: [],
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

/** Networks by symbol */
const networkConfigs: { [symbol: string]: NetworkConfig } = [
  BTC,
  BTC_TEST,
  LTC,
  LTC_TEST,
  VTC,
].reduce((bySymbol, config) => ({ ...bySymbol, [config.symbol]: config }), {})

export default networkConfigs
