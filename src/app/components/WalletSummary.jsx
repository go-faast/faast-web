import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { getWallet, getWalletWithHoldings } from 'Selectors'
import WalletLabel from 'Components/WalletLabel'

export const WalletSummary = ({
  hideIcon, hideBalance, wallet, showLink, labelTag,
}) => {
  return (
    <WalletLabel stacked
      wallet={wallet}
      showBalance={!hideBalance}
      hideIcon={hideIcon}
      showLink={showLink}
      tag={labelTag}
    />
  )
}

WalletSummary.propTypes = {
  wallet: PropTypes.object.isRequired,
  hideIcon: PropTypes.bool,
  hideBalance: PropTypes.bool,
  showLink: PropTypes.bool,
  labelTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

WalletSummary.defaultProps = {
  hideIcon: false,
  hideBalance: false,
  showLink: false,
  labelTag: 'div',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id, hideBalance }) => (!hideBalance ? getWalletWithHoldings : getWallet)(state, id),
}))(WalletSummary)

WalletSummary.Connected = ConnectedWalletSummary

export default WalletSummary
