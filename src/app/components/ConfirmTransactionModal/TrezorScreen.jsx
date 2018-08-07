import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import style from './style'

export default compose(
  setDisplayName('TrezorScreen'),
  setPropTypes({
    content: PropTypes.node
  })
)(({ content }) => (
  <div className='text-left mb-2' style={containerStyle}>
    <div className={style.outerOctagon}>
      <div className={style.octagon}></div>
    </div>
    <p className='mb-0 mt-0 lh-0'>{content}</p>
  </div>
))

const containerStyle = {
  position: 'relative',
  width: '300px',
  padding: '10px 12px 10px 45px',
  backgroundColor: '#000', 
  color: '#FFFFFF',
  borderRadius: '8px'
}