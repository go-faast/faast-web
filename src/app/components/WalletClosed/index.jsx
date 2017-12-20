import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

const WalletClosed = ({ wallet, path, component: Component }) => (
  <Route path={path} render={props => (
    (wallet.address || wallet.opened > 0) ? (
      <Redirect to='/balances' />
    ) : (
      <Component {...props} />
    )
  )} />
)

WalletClosed.propTypes = {
  wallet: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet
})

export default connect(mapStateToProps)(WalletClosed)
