import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import Icon from 'Components/Icon'
import Spinner from 'Components/Spinner'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'

export const WalletSummary = ({ icon, labelTag: LabelTag, wallet: { id, label, typeLabel, totalFiat, iconUrl, balancesLoaded } }) => (
  <Row className='gutter-0'>
    <Col xs='12'><LabelTag>{id === 'default' ? (<i>{label}</i>) : label}</LabelTag></Col>
    <Col xs='12'>
      <Row className='gutter-x-2 align-items-center justify-content-between'>
        {icon && (
          <Col xs='auto'>
            <Icon width='1.25em' height='1.25em' src={iconUrl}/>
          </Col>
        )}
        <Col className='text-muted'>{typeLabel}</Col>
        <Col xs='auto' className='text-muted'>
          {balancesLoaded
            ? display.fiat(totalFiat)
            : (<Spinner size='sm'/>)}
        </Col>
      </Row>
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
  labelTag: 'h5',
}

export const ConnectedWalletSummary = connect(createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
}))(WalletSummary)

WalletSummary.Connected = ConnectedWalletSummary

export default WalletSummary