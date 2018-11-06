import ledgerLogo from 'Img/wallet/ledger.png'
import trezorLogo from 'Img/wallet/trezor.png'
import blockstackLogo from 'Img/wallet/blockstack.png'

import metamaskLogo from 'Img/wallet/metamask.png'
import mistLogo from 'Img/wallet/mist.png'
import parityLogo from 'Img/wallet/parity.svg'
import coinbaseLogo from 'Img/wallet/coinbase.png'
import trustLogo from 'Img/wallet/trust.png'
import statusLogo from 'Img/wallet/status.png'

const switchPathSegwit = {
  primaryPrefix: 'm/49',
  primaryLabel: 'segwit account',
  secondaryPrefix: 'm/44',
  secondaryLabel: 'legacy (non-segwit) account',
}

export default {
  ledger: {
    name: 'Ledger Wallet',
    icon: ledgerLogo,
    hardware: true,
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\''
      },
      BTC: {
        derivationPath: 'm/49\'/0\'/0\'',
        switchPath: switchPathSegwit,
      },
      BCH: {
        derivationPath: 'm/44\'/145\'/0\'',
        switchPath: {
          primaryPrefix: 'm/44\'/145\'',
          primaryLabel: 'post-fork account',
          secondaryPrefix: 'm/44\'/0\'',
          secondaryLabel: 'legacy (pre-fork) account',
        }
      },
      LTC: {
        derivationPath: 'm/49\'/2\'/0\'',
        switchPath: switchPathSegwit,
      }
    }
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
    hardware: true,
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\'/0'
      },
      BTC: {
        derivationPath: null
      },
      BCH: {
        derivationPath: null
      },
      LTC: {
        derivationPath: null
      }
    }
  },
  blockstack: {
    name: 'Blockstack',
    icon: blockstackLogo,
  },
  metamask: {
    name: 'MetaMask',
    icon: metamaskLogo,
    web3: true,
  },
  mist: {
    name: 'Mist Browser',
    icon: mistLogo,
    web3: true,
  },
  parity: {
    name: 'Parity',
    icon: parityLogo,
    web3: true,
  },
  coinbase: {
    name: 'Coinbase Wallet',
    icon: coinbaseLogo,
    web3: true,
  },
  trust: {
    name: 'Trust Wallet',
    icon: trustLogo,
    web3: true,
  },
  status: {
    name: 'Status',
    icon: statusLogo,
    web3: true,
  }
}
