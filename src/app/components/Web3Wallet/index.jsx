import React from 'react'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import AccessTile from 'Components/AccessTile'
import { openWallet } from 'Actions/portfolio'
import web3 from 'Services/Web3'
import { EthereumWalletWeb3 } from 'Services/Wallet'

const typeToProps = {
  metamask: {
    name: 'MetaMask',
    icon: 'metamask-logo.png',
  },
  mist: {
    name: 'Mist Browser',
    icon: 'mist-logo.png',
  },
  parity: {
    name: 'Parity',
    icon: 'parity-logo.svg',
  }
}

const Web3Wallet = ({ type, openWallet, mock }) => {
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

      web3.eth.getAccounts()
      .then((accounts) => {
        const address = accounts[0]
        if (!address) return toastr.error(`Unable to retrieve ${name} account. Please ensure your account is unlocked.`, { timeOut: 10000 })

        openWallet(new EthereumWalletWeb3(), mock.mocking)
      })
      .catch((err) => {
        log.error(err)
        toastr.error(`Error retrieving ${name} account`)
      })
    })
  }

  return <AccessTile name={name} icon={icon} handleClick={handleClick} />
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (wallet, isMocking) => {
    dispatch(openWallet(wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Web3Wallet)
