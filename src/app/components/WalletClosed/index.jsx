import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { isCurrentPortfolioEmpty } from 'Selectors'

const WalletClosed = ({ isEmpty, path }) => (
  <Route path={path} render={() => (
    (isEmpty) ? (
      <Redirect to='/connect' />
    ) : (
      <Redirect to='/balances' />
    )
  )} />
)

WalletClosed.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired
}

const mapStateToProps = (state) => ({
  isEmpty: isCurrentPortfolioEmpty(state)
})

export default connect(mapStateToProps)(WalletClosed)
