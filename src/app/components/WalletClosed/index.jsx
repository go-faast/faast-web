import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { isCurrentPortfolioEmpty } from 'Selectors'

const WalletClosed = ({ isEmpty, path, component: Component }) => (
  <Route path={path} render={props => (
    (isEmpty) ? (
      <Component {...props} />
    ) : (
      <Redirect to='/balances' />
    )
  )} />
)

WalletClosed.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  isEmpty: isCurrentPortfolioEmpty(state)
})

export default connect(mapStateToProps)(WalletClosed)
