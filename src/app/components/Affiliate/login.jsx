import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateLogin = () => {
  return (
    <span>Login</span>
  )
}

export default compose(
  setDisplayName('AffiliateLogin'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateLogin)
