import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import style from './style'

export default compose(
  setDisplayName('Web3Screen'),
  setPropTypes({
    screens: PropTypes.arrayOf(PropTypes.shape({
      left: PropTypes.node,
      right: PropTypes.node,
    }))
  })
)(({ screens }) => (
  <div className={style.metaMaskContainer}>
    {screens.map(({ left, right }, i) => (
      <div key={i}>
        {left}
        {right}
      </div>
    ))}
  </div>
))