/**
 * Config for bitcoin like networks.
 *
 * paymentTypes sourced from: https://github.com/satoshilabs/slips/blob/master/slip-0132.md
 */
import coininfo from 'coininfo'
import bitcoin, { Network as BitcoinJsNetwork } from 'bitcoinjs-lib'
import { pick } from 'lodash'

type Bip32MagicNumber = {
  hex: string,
  b58: string,
}

type PaymentType = {
  addressEncoding: string,
  bip44Path: string | null,
  bip32: {
    public: Bip32MagicNumber,
    private: Bip32MagicNumber,
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
    'https://btc.bitaccess.ca', 'https://blockexplorer.com',
    'https://bitcore1.trezor.io', 'https://bitcore3.trezor.io',
  ],
  paymentTypes: [
    {
      addressEncoding: 'P2PKH',
      bip44Path: "m/44'/0'",
      bip32: {
        public: { hex: '0488b21e', b58: 'xpub' },
        private: { hex: '0488ade4', b58: 'xprv' },
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/0'",
      bip32: {
        public: { hex: '049d7cb2', b58: 'ypub' },
        private: { hex: '049d7878', b58: 'yprv' },
      },
    },
    {
      addressEncoding: 'P2WPKH',
      bip44Path: "m/84'/0'",
      bip32: {
        public: { hex: '04b24746', b58: 'zpub' },
        private: { hex: '04b2430c', b58: 'zprv' },
      },
    },
    {
      addressEncoding: 'P2SH-P2WSH',
      bip44Path: null,
      bip32: {
        public: { hex: '0295b43f', b58: 'Ypub' },
        private: { hex: '0295b005', b58: 'Yprv' },
      },
    },
    {
      addressEncoding: 'P2WSH',
      bip44Path: null,
      bip32: {
        public: { hex: '02aa7ed3', b58: 'Zpub' },
        private: { hex: '02aa7a99', b58: 'Zprv' },
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
        public: { hex: '043587cf', b58: 'tpub' },
        private: { hex: '04358394', b58: 'tprv' },
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/1'",
      bip32: {
        public: { hex: '044a5262', b58: 'upub' },
        private: { hex: '044a4e28', b58: 'uprv' },
      },
    },
    {
      addressEncoding: 'P2SH-P2WSH',
      bip44Path: null,
      bip32: {
        public: { hex: '024289ef', b58: 'Upub' },
        private: { hex: '024285b5', b58: 'Uprv' },
      },
    },
    {
      addressEncoding: 'P2WPKH',
      bip44Path: "m/84'/1'",
      bip32: {
        public: { hex: '045f1cf6', b58: 'vpub' },
        private: { hex: '045f18bc', b58: 'vprv' },
      },
    },
    {
      addressEncoding: 'P2WSH',
      bip44Path: null,
      bip32: {
        public: { hex: '02575483', b58: 'Vpub' },
        private: { hex: '02575048', b58: 'Vprv' },
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
        public: { hex: '019da462', b58: 'Ltub' },
        private: { hex: '019d9cfe', b58: 'Ltpv' },
      },
    },
    {
      addressEncoding: 'P2SH-P2WPKH',
      bip44Path: "m/49'/1'",
      bip32: {
        public: { hex: '01b26ef6', b58: 'Mtub' },
        private: { hex: '01b26792', b58: 'Mtpv' },
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
        public: { hex: '0436f6e1', b58: 'ttub' },
        private: { hex: '0436ef7d', b58: 'ttpv' },
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
        public: { hex: '0488b21e', b58: 'vtcp' },
        private: { hex: '0488ade4', b58: 'vtcv' },
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
