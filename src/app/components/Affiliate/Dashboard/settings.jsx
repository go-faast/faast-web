import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateSettings = () => {
  return (
    <span>Settings</span>
  )
}

export default compose(
  setDisplayName('AffiliateSettings'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateSettings)
