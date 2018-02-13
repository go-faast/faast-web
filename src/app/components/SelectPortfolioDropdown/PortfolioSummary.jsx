import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'

const PortfolioSummary = ({ wallet: { id, type, totalFiat } }) => (
  <Row className='no-gutters justify-content-between'>
    <Col xs='12'><h5>{id}</h5></Col>
    <Col xs='12' sm='auto'>{type}</Col>
    <Col xs='12' sm='auto'>{display.fiat(totalFiat)}</Col>
  </Row>
)

PortfolioSummary.propTypes = {
  id: PropTypes.string.isRequired,
}

const mapStateToProps = createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
})

export default connect(mapStateToProps)(PortfolioSummary)