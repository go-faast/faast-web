import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import TrezorScreen from './TrezorScreen'
import Timer from '../Timer'

export default compose(
  setDisplayName('TrezorInstructions'),
  setPropTypes({
    appName: PropTypes.string.isRequired,
    screens: PropTypes.arrayOf(PropTypes.shape({
      top: PropTypes.node,
      bottom: PropTypes.node,
    }))
  })
)(({ screens }) => (
  <div>
    <p>Please confirm the transaction on your device. You should see the following information on screen.</p>
    <div className='pt-1 pb-1' style={instructionsContainerStyle}>
      <div className='outer-octagon'>
        <div className='octagon'></div>
      </div>
      {screens.map(({ top, bottom }, i) => (
      <TrezorScreen key={i} index={i} top={top} bottom={bottom}/>
      ))}
    </div>
  </div>
))

const timerStyle = {
  color: '#c3c26d',
  fontSize: '80%'
}

const instructionsContainerStyle = {
  position: 'relative', 
  background: '#000', 
  color: '#fff' 
}