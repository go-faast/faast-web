import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

export default compose(
  setDisplayName('LedgerScreen'),
  setPropTypes({
    top: PropTypes.node,
    bottom: PropTypes.node,
  })
)(({ top, bottom }) => (
  <div className='text-center my-2' style={{ backgroundColor: '#000', color: '#00FFFF' }}>
    <p className='mb-0'>{top}</p>
    <p>{bottom}</p>
  </div>
))
