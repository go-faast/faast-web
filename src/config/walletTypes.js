import ledgerLogo from '../../res/img/wallet/ledger.png'
import trezorLogo from '../../res/img/wallet/trezor.png'
import blockstackLogo from '../../res/img/wallet/blockstack.png'
import metamaskLogo from '../../res/img/wallet/metamask.png'
import mistLogo from '../../res/img/wallet/mist.png'
import parityLogo from '../../res/img/wallet/parity.svg'
import coinbaseLogo from '../../res/img/wallet/coinbase.png'
import trustLogo from '../../res/img/wallet/trust.png'
import statusLogo from '../../res/img/wallet/status.png'

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
    website: 'https://www.ledger.com/',
    hardware: true,
    slogan: 'Keep your crypto secure, everywhere.', 
    description: 'Ledger offers smartcard-based crypto asset hardware wallets bringing optimal protection level to your bitcoins, ethereums, ripple and more - without sacrificing usability or control.',
    graphic: 'https://cdn.shopify.com/s/files/1/2974/4858/products/ledger-nano-x-stand-up_grande_7a016731-824a-4d00-acec-40acfdfed9dc.png?v=1545313453',
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
    graphic: 'https://shop.trezor.io/static/img/trezor_duopack.png',
    slogan: 'The safe place for your coins.',
    website: 'https://trezor.io/',
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
    website: 'https://metamask.io/',
    icon: metamaskLogo,
    web3: true,
  },
  mist: {
    name: 'Mist Browser',
    website: 'https://github.com/ethereum/mist',
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
    website: 'https://wallet.coinbase.com/',
    icon: coinbaseLogo,
    web3: true,
  },
  trust: {
    name: 'Trust Wallet',
    website: 'https://trustwalletapp.com/',
    icon: trustLogo,
    web3: true,
  },
  status: {
    name: 'Status',
    website: 'https://status.im/',
    icon: statusLogo,
    web3: true,
  }
}
