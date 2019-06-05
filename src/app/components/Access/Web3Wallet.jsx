import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers } from 'recompose'

import config from 'Config'
import { openWeb3Wallet } from 'Actions/access'

import AccessTile from './AccessTile'

export default compose(
  setDisplayName('Web3WalletTile'),
  setPropTypes({
    type: PropTypes.oneOf(config.web3WalletTypes),
    forwardurl: PropTypes.string
  }),
  connect(null, {
    openWallet: openWeb3Wallet
  }),
  withProps(({ type }) => ({
    ...config.walletTypes[type],
  })),
  withHandlers({
    handleClick: ({ openWallet, type, forwardurl }) => () => openWallet(type, forwardurl)
  }),
)(({ name, icon, handleClick }) => (
  <AccessTile name={name} icon={icon} onClick={handleClick} />
))
