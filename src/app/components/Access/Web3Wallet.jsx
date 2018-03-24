import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { openWeb3Wallet } from 'Actions/access'

import metamaskLogo from 'Img/metamask-logo.png'
import mistLogo from 'Img/mist-logo.png'
import parityLogo from 'Img/parity-logo.svg'

import AccessTile from './AccessTile'

const walletTypes = {
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

const Web3Wallet = ({ type, handleClick }) => {
  const { name, icon } = walletTypes[type]
  return <AccessTile name={name} icon={icon} onClick={handleClick} />
}

Web3Wallet.propTypes = {
  type: PropTypes.oneOf(Object.keys(walletTypes)),
}

const mapDispatchToProps = {
  handleClick: openWeb3Wallet
}

export default connect(null, mapDispatchToProps)(Web3Wallet)
