import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'
import styles from './style'

const WalletSummary = ({ icon, wallet: { id, label, typeLabel, totalFiat, iconUrl } }) => (
  <Row className='large-gutters-x align-items-center'>
    {icon && (
      <Col xs='auto'>
        <div className={styles.walletIcon}><img src={iconUrl} className={styles.walletIconImg}/></div>
      </Col>
    )}
    <Col>
      <Row className='no-gutters justify-content-between'>
        <Col xs='12'><h6 className={classNames({ 'font-italic': id === 'default' })}>{label}</h6></Col>
        <Col xs='12' sm='auto' className='text-medium-grey'>{typeLabel}</Col>
        <Col xs='12' sm='auto'>{display.fiat(totalFiat)}</Col>
      </Row>
    </Col>
  </Row>
)

WalletSummary.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.bool,
}

WalletSummary.defaultProps = {
  icon: false,
}

const mapStateToProps = createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
})

export default connect(mapStateToProps)(WalletSummary)