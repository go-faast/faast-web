import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliatePayouts = () => {
  return (
    <span>Payouts</span>
  )
}

export default compose(
  setDisplayName('AffiliatePayouts'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliatePayouts)
