import React from 'react'
import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import { getWalletWithHoldings } from 'Selectors'
import display from 'Utilities/display'
import styles from './style'

const WalletSummary = ({ icon, labelTag: LabelTag, wallet: { id, label, typeLabel, totalFiat, iconUrl, balancesLoaded } }) => (
  <Row className='no-gutters'>
    <Col xs='12'><LabelTag>{id === 'default' ? (<i>{label}</i>) : label}</LabelTag></Col>
    <Col xs='12'>
      <Row className='small-gutters-x align-items-center justify-content-between'>
        {icon && (
          <Col xs='auto'>
            <div className={styles.walletIcon} style={{ backgroundImage: `url(${iconUrl})` }}></div>
          </Col>
        )}
        <Col className='text-medium-grey'>{typeLabel}</Col>
        <Col xs='auto'>
          {balancesLoaded
            ? display.fiat(totalFiat)
            : (<span className='faast-loading loading-small'/>)}
        </Col>
      </Row>
    </Col>
  </Row>
)

WalletSummary.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.bool,
  labelTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

WalletSummary.defaultProps = {
  icon: false,
  labelTag: 'h6',
}

const mapStateToProps = createStructuredSelector({
  wallet: (state, { id }) => getWalletWithHoldings(state, id),
})

export default connect(mapStateToProps)(WalletSummary)