import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { omit } from 'lodash'
import { Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import classNames from 'class-names'

import routes from 'Routes'
import { defaultPortfolioId } from 'Actions/portfolio'
import { tag as tagPropType } from 'Utilities/propTypes'
import { getWallet, getWalletWithHoldings, getWalletExtendedLabel, getWalletLabel } from 'Selectors'

import IconLabel from 'Components/IconLabel'
import WalletBalance from 'Components/WalletBalance'

export const WalletLabel = ({
  hideIcon, wallet, grouped, label, iconProps, showBalance, showLink, stacked, id, ...props,
}) => {
  const walletLabel = wallet && wallet.label
  const typeLabel = wallet && wallet.typeLabel
  const labelString = label && !grouped ? label : grouped ? typeLabel : walletLabel
  const labelNode = id === defaultPortfolioId ? (<i>{labelString}</i>) : labelString
  const labelLink = showLink && wallet && wallet.address ? (
    <Link to={routes.viewOnlyAddress(wallet.address)}>
      {labelNode}
    </Link>
  ) : labelNode
  const combinedIconProps = {
    ...((wallet && wallet.iconProps) || {}),
    ...iconProps,
  }
  const iconLabel = (
    <IconLabel
      label={labelLink}
      iconProps={!hideIcon && !stacked && combinedIconProps}
      {...omit(props, 'id', 'dispatch')}/>
  )
  if (showBalance) {
    const symbol = typeof showBalance === 'string' ? showBalance : '$'
    return (
      <Row className={classNames('justify-content-between gutter-x-4', { 'flex-nowrap': !stacked })}>
        <Col xs={stacked ? '12' : 'auto'}>
          {iconLabel}
        </Col>
        {stacked && (
          <Col>
            <IconLabel label={wallet && wallet.typeLabel} iconProps={!hideIcon && combinedIconProps} className='text-muted'/>
          </Col>
        )}
        <Col xs='auto'>
          <small>
            <WalletBalance wallet={wallet} symbol={symbol}/>
          </small>
        </Col>
      </Row>
    )
  }
  return iconLabel
}

WalletLabel.propTypes = {
  wallet: PropTypes.object, // If not provided must provide id
  hideIcon: PropTypes.bool, // Don't show wallet icon
  iconProps: PropTypes.object, // Additional props to pass to icon
  showBalance: PropTypes.oneOfType([
    PropTypes.bool, // true -> show fiat
    PropTypes.string // SYMBOL -> show asset balance
  ]),
  showLink: PropTypes.bool, // Wrap label in link to view only page if available
  stacked: PropTypes.bool, // Show label on first line with typeLabel and balance on second line
  extended: PropTypes.bool, // Show the extended label (includes parent)
  tag: tagPropType,
  grouped: PropTypes.bool
}

WalletLabel.defaultProps = {
  wallet: null,
  hideIcon: false,
  iconProps: {},
  showBalance: false,
  showLink: false,
  stacked: false,
  extended: false,
  tag: 'div',
  grouped: false,
}

export const ConnectedWalletLabel = connect(createStructuredSelector({
  wallet: (state, { id, showBalance }) => showBalance === true
    ? getWalletWithHoldings(state, id)
    : getWallet(state, id),
  label: (state, { id, extended }) => extended
    ? getWalletExtendedLabel(state, id)
    : getWalletLabel(state, id),
}))(WalletLabel)

WalletLabel.Connected = ConnectedWalletLabel

export default WalletLabel
