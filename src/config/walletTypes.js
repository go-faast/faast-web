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
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-ledger-wallet-d71f5d16a43d',
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
    description: 'Trezor offers you a secure vault for your digital assets. Store bitcoins, litecoins, passwords, logins, and keys without worries.',
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-trezor-wallet-50f6e85fe923',
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
    graphic: 'https://cryptominded.com/wp-content/uploads/2017/06/18894_266881-900x888.jpg',
    slogan: 'The easiest way to start building decentralized blockchain apps.',
    description: 'Blockstack is building an ecosystem that gives your users control over their fundamental digital rights.'
  },
  metamask: {
    name: 'MetaMask',
    website: 'https://metamask.io/',
    icon: metamaskLogo,
    web3: true,
    graphic: 'https://avatars0.githubusercontent.com/u/11744586?s=280&v=4',
    slogan: 'Bring Ethereum to your browser.',
    description: 'MetaMask is a bridge that allows you to visit the distributed web of tomorrow in your browser today. It allows you to run Ethereum dApps right in your browser.', 
    howTo: 'https://medium.com/faast/metamask-faast-the-easiest-way-to-diversify-your-cryptocurrency-portfolio-4551ea649439'
  },
  mist: {
    name: 'Mist Browser',
    website: 'https://github.com/ethereum/mist',
    icon: mistLogo,
    web3: true,
    graphic: 'https://www.cryptocompare.com/media/20713/etehreum_wallet.png',
    slogan: 'Mist. Browse and use Ðapps on the Ethereum network.',
    description: 'The Mist browser is the tool of choice to browse and use Ðapps.'
  },
  parity: {
    name: 'Parity',
    icon: parityLogo,
    website: 'https://www.parity.io/',
    web3: true,
    graphic: 'http://xexr.com/wp-content/uploads/2017/07/parity_large.jpg',
    slogan: 'Blockchain Infrastructure for the Decentralised Web.',
    description: 'Parity Technologies builds core blockchain infrastructure. From Parity Ethereum, the most advanced Ethereum client, to Polkadot, the next-generation interoperable blockchain network.'
  },
  coinbase: {
    name: 'Coinbase Wallet',
    website: 'https://wallet.coinbase.com/',
    icon: coinbaseLogo,
    web3: true,
    graphic: 'https://wallet.coinbase.com/assets/images/hero/wallet-image.png',
    slogan: 'The easiest and most secure crypto wallet.',
    description: 'Coinbase: the simple, safe way to buy, manage and sell your cryptocurrency.',
    howTo: 'https://medium.com/faast/how-to-swap-btc-for-eth-with-coinbase-and-save-3d3dc27e18d2'
  },
  trust: {
    name: 'Trust Wallet',
    website: 'https://trustwalletapp.com/',
    icon: trustLogo,
    web3: true,
    graphic: 'https://uploads-ssl.webflow.com/5a88babea6e0f90001b39b0d/5bec7f602a30ee0c8a498094_ethereum-wallet-mobile.png',
    slogan: 'Secure wallet for Ethereum, ERC20, ERC223 & ERC721 tokens.',
    description: 'Trust Wallet is the best ethereum wallet and multi cryptocurrency wallet to store your favourite ERC721 &  ERC20 tokens.',
  },
  status: {
    name: 'Status',
    website: 'https://status.im/',
    icon: statusLogo,
    web3: true,
    graphic: 'https://s2.coinmarketcap.com/static/img/coins/200x200/1759.png',
    slogan: 'Access a Better Web, Anywhere.',
    description: 'With Status you can chat, browse and transact securely in an open source community committed to bringing the power of Ethereum and a more distributed internet to your pocket.',
    howTo: 'https://medium.com/faast/how-to-use-status-mobile-ethereum-wallet-with-faast-4936620e96fd'
  }
}
