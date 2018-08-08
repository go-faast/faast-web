import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'
import style from './style'

export default compose(
  setDisplayName('TrezorScreen'),
  setPropTypes({
    content: PropTypes.node
  })
)(({ content }) => (
  <div className={classNames('text-left mb-2', style.trezorContainer)}>
    <div className={style.outerOctagon}>
      <div className={style.octagon}></div>
    </div>
    <p className='mb-0 mt-0 lh-0'>{content}</p>
  </div>
))