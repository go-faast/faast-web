import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'

import style from './style'

export default compose(
  setDisplayName('LedgerScreen'),
  setPropTypes({
    top: PropTypes.node,
    bottom: PropTypes.node,
  })
)(({ top, bottom }) => (
  <div className={classNames('text-center my-2', style.ledgerScreen)} >
    {top}<br/>
    {bottom}
  </div>
))
