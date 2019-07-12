/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import LedgerScreen from './LedgerScreen'
import Timer from '../Timer'

import T from 'Components/i18n/T'

export default compose(
  setDisplayName('LedgerInstructions'),
  setPropTypes({
    appName: PropTypes.string.isRequired,
    screens: PropTypes.arrayOf(PropTypes.shape({
      top: PropTypes.node,
      bottom: PropTypes.node,
    }))
  })
)(({ appName, screens }) => (
  <div>
    <T tag='p' i18nKey='app.ledgerInstructions.pleaseConfirm'>Please confirm the transaction on your device. You should see the following information on screen.</T>
    <T tag='p' i18nKey='app.ledgerInstructions.tip'><small>
      Tip: If you don't see the transaction on your device, ensure you've unlocked it using your PIN and have opened the {{ appName }} app.
    </small></T>
    <small><Timer className='text-warning' seconds={60} label={<T tag='span' i18nKey='app.ledgerInstructions.confirmWithin'>Please confirm within:</T>}/></small>
    {screens.map(({ top, bottom }, i) => (
      <LedgerScreen key={i} top={top} bottom={bottom}/>
    ))}
  </div>
))
