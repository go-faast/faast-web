import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateSignupForm = () => {
  return (
    <span>Signup</span>
  )
}

export default compose(
  setDisplayName('AffiliateSignupForm'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateSignupForm)
