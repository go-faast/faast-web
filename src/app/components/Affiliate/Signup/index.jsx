import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateSignup = () => {
  return (
    <span>Signup</span>
  )
}

export default compose(
  setDisplayName('AffiliateSignup'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateSignup)
