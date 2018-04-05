import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import IconLabel from 'Components/IconLabel'
import Spinner from 'Components/Spinner'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'

export const WalletSummary = ({ icon, labelClass, wallet: { id, label, typeLabel, totalFiat, iconProps, balancesLoaded } }) => (
  <Row className='gutter-0'>
    <Col xs='12' className={labelClass}>{id === 'default' ? (<i>{label}</i>) : label}</Col>
    <Col>
      <IconLabel label={typeLabel} iconProps={icon && iconProps}/>
    </Col>
    <Col xs='auto'>
      {balancesLoaded
        ? display.fiat(totalFiat)
        : (<Spinner size='sm'/>)}
    </Col>
  </Row>
)

WalletSummary.propTypes = {
  wallet: PropTypes.object.isRequired,
  icon: PropTypes.bool,
  labelTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

WalletSummary.defaultProps = {
  icon: false,
  labelTag: 'div',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
}))(WalletSummary)

WalletSummary.Connected = ConnectedWalletSummary

export default WalletSummary