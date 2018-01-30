import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { getCurrentWallet } from 'Selectors'

const WalletOpened = ({ wallet, portfolio, path, component: Component }) => (
  <Route path={path} render={props => {
    if (wallet && wallet.id) {
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
  wallet: getCurrentWallet(state),
  portfolio: state.portfolio
})

export default connect(mapStateToProps)(WalletOpened)
