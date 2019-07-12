import ledgerLogo from '../../res/img/wallet/ledger.png'
import trezorLogo from '../../res/img/wallet/trezor.png'
import blockstackLogo from '../../res/img/wallet/blockstack.png'
import metamaskLogo from '../../res/img/wallet/metamask.png'
import mistLogo from '../../res/img/wallet/mist.png'
import parityLogo from '../../res/img/wallet/parity.svg'
import coinbaseLogo from '../../res/img/wallet/coinbase.png'
import trustLogo from '../../res/img/wallet/trust.png'
import statusLogo from '../../res/img/wallet/status.png'

import ledgerGraphic from '../../res/img/wallet/ledgerGraphic.png'
import trezorGraphic from '../../res/img/wallet/trezorGraphic.png'
import blockstackGraphic from '../../res/img/wallet/blockstackGraphic.jpg'
import metamaskGraphic from '../../res/img/wallet/metamaskGraphic.png'
import mistGraphic from '../../res/img/wallet/mistGraphic.png'
import parityGraphic from '../../res/img/wallet/parityGraphic.jpg'
import coinbaseGraphic from '../../res/img/wallet/coinbaseGraphic.png'
import trustGraphic from '../../res/img/wallet/trustGraphic.png'
import statusGraphic from '../../res/img/wallet/statusGraphic.png'

import { i18nTranslate as t } from '../utilities/translate'

const switchPathSegwit = {
  primaryPrefix: 'm/49',
  primaryLabel: 'segwit account',
  secondaryPrefix: 'm/44',
  secondaryLabel: t('app.walletTypes.nonSegwit', 'legacy (non-segwit) account'),
}

const commonSupportedAssets = {
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
      secondaryLabel: t('app.walletTypes.preFork', 'legacy (pre-fork) account'),
    }
  },
  LTC: {
    derivationPath: 'm/49\'/2\'/0\'',
    switchPath: switchPathSegwit,
  }
}

export default {
  ledger: {
    name: t('app.walletTypes.ledger', 'Ledger Wallet'),
    icon: ledgerLogo,
    website: 'https://www.ledger.com/',
    hardware: true,
    slogan: t('app.walletTypes.ledgerSlogan', 'Keep your crypto secure, everywhere.'), 
    description: t('app.walletTypes.ledgerDescription', 'Ledger offers smartcard-based crypto asset hardware wallets bringing optimal protection level to your bitcoins, ethereums, ripple and more - without sacrificing usability or control.'),
    graphic: ledgerGraphic,
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-ledger-wallet-d71f5d16a43d',
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\''
      },
      ...commonSupportedAssets,
    }
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
    graphic: trezorGraphic,
    slogan: t('app.walletTypes.trezorSlogan', 'The safe place for your coins.'),
    description: t('app.walletTypes.trezorDescription', 'Trezor offers you a secure vault for your digital assets. Store bitcoins, litecoins, passwords, logins, and keys without worries.'),
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-trezor-wallet-50f6e85fe923',
    website: 'https://trezor.io/',
    hardware: true,
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\'/0'
      },
      ...commonSupportedAssets,
    }
  },
  blockstack: {
    name: 'Blockstack',
    icon: blockstackLogo,
    website: 'https://blockstack.org',
    graphic: blockstackGraphic,
    slogan: t('app.walletTypes.blockstackSlogan', 'The easiest way to start building decentralized blockchain apps.'),
    description: t('app.walletTypes.blockstackDescription', 'Blockstack is building an ecosystem that gives your users control over their fundamental digital rights.')
  },
  metamask: {
    name: 'MetaMask',
    website: 'https://metamask.io/',
    icon: metamaskLogo,
    web3: true,
    graphic: metamaskGraphic,
    slogan: t('app.walletTypes.metmaskSlogan','Bring Ethereum to your browser.'),
    description: t('app.walletTypes.metamaskDescription', 'MetaMask is a bridge that allows you to visit the distributed web of tomorrow in your browser today. It allows you to run Ethereum dApps right in your browser.'), 
    howTo: 'https://medium.com/faast/metamask-faast-the-easiest-way-to-diversify-your-cryptocurrency-portfolio-4551ea649439'
  },
  mist: {
    name: t('app.walletTypes.mist', 'Mist Browser'),
    website: 'https://github.com/ethereum/mist',
    icon: mistLogo,
    web3: true,
    graphic: mistGraphic,
    slogan: t('app.walletTypes.mistSlogan', 'Mist. Browse and use Ðapps on the Ethereum network.'),
    description: t('app.walletTypes.mistDescription', 'The Mist browser is the tool of choice to browse and use Ðapps.')
  },
  parity: {
    name: 'Parity',
    icon: parityLogo,
    website: 'https://www.parity.io/',
    web3: true,
    graphic: parityGraphic,
    slogan: t('app.walletTypes.paritySlogan', 'Blockchain Infrastructure for the Decentralised Web.'),
    description: t('app.walletTypes.parityDescription', 'Parity Technologies builds core blockchain infrastructure. From Parity Ethereum, the most advanced Ethereum client, to Polkadot, the next-generation interoperable blockchain network.')
  },
  coinbase: {
    name: t('app.walletTypes.coinbase', 'Coinbase Wallet'),
    website: 'https://wallet.coinbase.com/',
    icon: coinbaseLogo,
    web3: true,
    graphic: coinbaseGraphic,
    slogan: t('app.walletTypes.coinbaseSlogan', 'The easiest and most secure crypto wallet.'),
    description: t('app.walletTypes.coinbaseDescription', 'Coinbase: the simple, safe way to buy, manage and sell your cryptocurrency.'),
    howTo: 'https://medium.com/faast/how-to-use-coinbase-wallet-with-faast-and-swap-cryptocurrency-on-your-smartphone-846e8a5f93d1'
  },
  trust: {
    name: t('app.walletTypes.trust', 'Trust Wallet'),
    website: 'https://trustwalletapp.com/',
    icon: trustLogo,
    web3: true,
    graphic: trustGraphic,
    slogan: t('app.walletTypes.trustSlogan', 'Secure wallet for Ethereum, ERC20, ERC223 & ERC721 tokens.'),
    description: t('app.walletTypes.trustDescription', 'Trust Wallet is the best ethereum wallet and multi cryptocurrency wallet to store your favourite ERC721 & ERC20 tokens.'),
  },
  status: {
    name: 'Status',
    website: 'https://status.im/',
    icon: statusLogo,
    web3: true,
    graphic: statusGraphic,
    slogan: t('app.walletTypes.statusSlogan', 'Access a Better Web, Anywhere.'),
    description: t('app.walletTypes.statusDescription', 'With Status you can chat, browse and transact securely in an open source community committed to bringing the power of Ethereum and a more distributed internet to your pocket.'),
    howTo: 'https://medium.com/faast/how-to-use-status-mobile-ethereum-wallet-with-faast-4936620e96fd'
  }
}
