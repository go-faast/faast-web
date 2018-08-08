import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'
import style from './style'

export default compose(
  setDisplayName('TrezorScreen'),
  setPropTypes({
    children: PropTypes.node
  })
)(({ children }) => (
  <div className={classNames('text-left mb-2 mx-auto', style.trezorScreen)}>
    <div className={style.outerOctagon}>
      <div className={style.octagon}></div>
    </div>
    <p className='mb-0 mt-0 lh-0'>{children}</p>
  </div>
))
