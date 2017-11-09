import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

const WalletClosedController = ({ wallet, path, component: Component }) => (
  <Route path={path} render={props => (
    wallet.address ? (
      <Redirect to='/balances' />
    ) : (
      <Component {...props} />
    )
  )} />
)

WalletClosedController.propTypes = {
  wallet: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet
})

export default connect(mapStateToProps)(WalletClosedController)
