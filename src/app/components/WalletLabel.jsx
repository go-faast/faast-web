import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { omit } from 'lodash'

import { tag as tagPropType } from 'Utilities/propTypes'
import { ellipsize } from 'Utilities/display'
import { getWallet } from 'Selectors'

import IconLabel from 'Components/IconLabel'

export const WalletLabel = ({ hideIcon, wallet, id, ...props }) => (
  <IconLabel
    label={wallet ? wallet.label : ellipsize(id, 8, 6)}
    iconProps={!hideIcon && wallet && wallet.iconProps}
    {...omit(props, 'id', 'dispatch')}/>
)

WalletLabel.propTypes = {
  wallet: PropTypes.object,
  hideIcon: PropTypes.bool,
  tag: tagPropType,
}

WalletLabel.defaultProps = {
  wallet: null,
  hideIcon: false,
  tag: 'div',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id }) => getWallet(state, id),
}))(WalletLabel)

WalletLabel.Connected = ConnectedWalletSummary

export default WalletLabel
