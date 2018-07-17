import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import IconLabel from 'Components/IconLabel'
import Spinner from 'Components/Spinner'
import Expandable from 'Components/Expandable'

import { getWallet, getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'

export const WalletSummary = ({
  hideIcon, hideBalance, labelClass,
  wallet: { id, label, typeLabel, totalFiat, iconProps, holdingsLoaded, holdingsError }
}) => (
  <Row className='gutter-0'>
    <Col xs='12' className={labelClass}>{id === 'default' ? (<i>{label}</i>) : label}</Col>
    <Col>
      <IconLabel label={typeLabel} iconProps={!hideIcon && iconProps} className='text-muted'/>
    </Col>
    {!hideBalance && (
      <Col xs='auto'>
        {(holdingsLoaded || holdingsError)
          ? (<span>
              {!holdingsLoaded && holdingsError && (
                <Expandable
                  shrunk={<i className='fa fa-exclamation-triangle text-danger mr-2'/>}
                  expanded={holdingsError}/>
              )}
              {display.fiat(totalFiat)}
            </span>)
          : (<Spinner size='sm'/>)}
      </Col>
    )}
  </Row>
)

WalletSummary.propTypes = {
  wallet: PropTypes.object.isRequired,
  hideIcon: PropTypes.bool,
  hideBalance: PropTypes.bool,
  labelTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

WalletSummary.defaultProps = {
  icon: false,
  showBalance: false,
  labelTag: 'div',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id, hideBalance }) => (!hideBalance ? getWalletWithHoldings : getWallet)(state, id),
}))(WalletSummary)

WalletSummary.Connected = ConnectedWalletSummary

export default WalletSummary
