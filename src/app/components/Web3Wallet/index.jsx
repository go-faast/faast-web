import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import AccessTile from 'Components/AccessTile'
import { openWallet } from 'Actions/portfolio'
import web3 from 'Services/Web3'
import { EthereumWalletWeb3 } from 'Services/Wallet'

import metamaskLogo from 'Img/metamask-logo.png'
import mistLogo from 'Img/mist-logo.png'
import parityLogo from 'Img/parity-logo.svg'

const typeToProps = {
  metamask: {
    name: 'MetaMask',
    icon: metamaskLogo,
  },
  mist: {
    name: 'Mist Browser',
    icon: mistLogo,
  },
  parity: {
    name: 'Parity',
    icon: parityLogo,
  }
}

const Web3Wallet = ({ type, openWallet, mock, routerPush }) => {
  const { name, icon } = (typeToProps[type] || {})
  if (typeof name === 'undefined') {
    log.error(`Unknown Web3Wallet type ${type}`)
    return null
  }
  const handleClick = () => {
    if (web3.providerType !== 'user') {
      return toastr.error(`Please enable the ${name} extension`)
    }

    if (!web3.version || !web3.eth.net.getId) {
      return toastr.error('Unable to determine network ID')
    }
    web3.eth.net.getId((err, id) => {
      if (err) {
        log.error(err)
        return toastr.error('Error getting network ID')
      }
      if (id !== 1) {
        return toastr.error(`Please adjust ${name} to use the "Main Ethereum Network"`, { timeOut: 10000 })
      }

      EthereumWalletWeb3.fromDefaultAccount()
        .then((wallet) => openWallet(wallet, mock.mocking))
        .then(() => routerPush('/balances'))
        .catch((e) => {
          log.error(e)
          toastr.error(e.message)
        })
    })
  }

  return <AccessTile name={name} icon={icon} handleClick={handleClick} />
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = {
  openWallet,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(Web3Wallet)
