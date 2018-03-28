import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import { tag as tagPropType } from 'Utilities/propTypes'
import { isDefaultPortfolioEmpty } from 'Selectors'

const WalletClosed = ({ isClosed, tag: Tag, ...props }) => (
  <Tag render={() => (
    isClosed
      ? (<Redirect to='/connect' />)
      : (<Redirect to='/dashboard' />)
  )} {...props}/>
)

WalletClosed.propTypes = {
  tag: tagPropType
}

WalletClosed.defaultProps = {
  tag: Route
}

const mapStateToProps = createStructuredSelector({
  isClosed: isDefaultPortfolioEmpty
})

export default connect(mapStateToProps)(WalletClosed)
