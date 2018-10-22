import ledgerLogo from 'Img/wallet/ledger-logo.png'
import trezorLogo from 'Img/wallet/trezor-logo.png'

export default {
  ledger: {
    name: 'Ledger Wallet',
    icon: ledgerLogo,
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\''
      },
      BTC: {
        derivationPath: 'm/49\'/0\'/0\'',
        segwitPrefix: 'm/49',
        legacyPrefix: 'm/44',
      },
      BCH: {
        derivationPath: 'm/44\'/145\'/0\'',
      },
      LTC: {
        derivationPath: 'm/49\'/2\'/0\'',
        segwitPrefix: 'm/49',
        legacyPrefix: 'm/44',
      }
    }
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
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
  }
}
