import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateSwaps = () => {
  return (
    <span>Swaps</span>
  )
}

export default compose(
  setDisplayName('AffiliateSwaps'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateSwaps)
