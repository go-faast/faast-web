import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { getCurrentPortfolio } from 'Selectors'

const WalletClosed = ({ portfolio, path, component: Component }) => (
  <Route path={path} render={props => (
    (portfolio && portfolio.wallets.length > 0) ? (
      <Redirect to='/balances' />
    ) : (
      <Component {...props} />
    )
  )} />
)

WalletClosed.propTypes = {
  portfolio: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  portfolio: getCurrentPortfolio(state)
})

export default connect(mapStateToProps)(WalletClosed)
