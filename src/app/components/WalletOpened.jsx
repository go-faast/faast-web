import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'

import { tag as tagPropType } from 'Utilities/propTypes'
import { isDefaultPortfolioEmpty } from 'Selectors'

const WalletOpened = ({ isClosed, tag: Tag, component: Component, ...props }) => (
  <Tag render={(renderProps) => (
    !isClosed
      ? (<Component {...renderProps} />)
      : (<Redirect to='/connect' />)
  )} {...props}/>
)

WalletOpened.propTypes = {
  tag: tagPropType,
  component: PropTypes.func.isRequired
}

WalletOpened.defaultProps = {
  tag: Route
}

const mapStateToProps = createStructuredSelector({
  isClosed: isDefaultPortfolioEmpty,
})

export default connect(mapStateToProps)(WalletOpened)
