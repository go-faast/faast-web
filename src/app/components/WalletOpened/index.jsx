import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

const WalletOpened = ({ wallet, portfolio, path, component: Component }) => (
  <Route path={path} render={props => {
    if (wallet.address || wallet.opened > 0) {
      if (path === '/balances' || portfolio.list.length) {
        return (
          <Component {...props} />
        )
      } else {
        return (
          <Redirect to='/balances' />
        )
      }
    } else {
      return (
        <Redirect to='/' />
      )
    }
  }} />
)

WalletOpened.propTypes = {
  wallet: PropTypes.object.isRequired,
  portfolio: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  portfolio: state.portfolio
})

export default connect(mapStateToProps)(WalletOpened)
