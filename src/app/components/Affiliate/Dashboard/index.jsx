import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'

const AffiliateDashboard = () => {
  return (
    <span>Dashboard</span>
  )
}

export default compose(
  setDisplayName('AffiliateDashboard'),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateDashboard)
