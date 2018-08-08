import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import TrezorScreen from './TrezorScreen'

export default compose(
  setDisplayName('TrezorInstructions'),
  setPropTypes({
    appName: PropTypes.string.isRequired,
    screens: PropTypes.arrayOf(PropTypes.node)
  })
)(({ screens }) => (
  <div>
    <p>Please confirm the transaction on your device. You should see the following information on screen.</p>
    <div className='pt-1 pb-1'>
      {screens.map((content, i) => (
        <TrezorScreen key={i}>{content}</TrezorScreen>
      ))}
    </div>
  </div>
))
