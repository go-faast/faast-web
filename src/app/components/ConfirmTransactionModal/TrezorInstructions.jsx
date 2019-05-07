import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import TrezorScreen from './TrezorScreen'

import T from 'Components/i18n/T'

export default compose(
  setDisplayName('TrezorInstructions'),
  setPropTypes({
    appName: PropTypes.string.isRequired,
    screens: PropTypes.arrayOf(PropTypes.node)
  })
)(({ screens }) => (
  <div>
    <T tag='p' i18nKey='app.trezorInstructions.pleaseConfirm'>Please confirm the transaction on your device. You should see the following information on screen.</T>
    <div className='pt-1 pb-1'>
      {screens.map((content, i) => (
        <TrezorScreen key={i}>{content}</TrezorScreen>
      ))}
    </div>
  </div>
))
