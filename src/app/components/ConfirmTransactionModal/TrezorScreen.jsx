import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

export default compose(
  setDisplayName('TrezorScreen'),
  setPropTypes({
    top: PropTypes.node,
    bottom: PropTypes.node,
  })
)(({ top, bottom }) => (
  <div className='text-center mb-0'>
    <p className='mb-0 mt-0'>{top}</p>
    <p className='mb-0 mt-0'>{bottom}</p>
  </div>
))
