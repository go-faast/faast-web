import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { omit } from 'lodash'

import { tagPropType } from 'Utilities/propTypes'
import { getWallet } from 'Selectors'

import IconLabel from 'Components/IconLabel'

export const WalletLabel = ({ hideIcon, wallet: { label, iconProps }, ...props }) => (
  <IconLabel label={label} iconProps={!hideIcon && iconProps} {...omit(props, 'id')}/>
)

WalletLabel.propTypes = {
  wallet: PropTypes.object.isRequired,
  hideIcon: PropTypes.bool,
  tag: tagPropType,
}

WalletLabel.defaultProps = {
  hideIcon: false,
  tag: 'div',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id }) => getWallet(state, id),
}))(WalletLabel)

WalletLabel.Connected = ConnectedWalletSummary

export default WalletLabel