import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import Units from 'Components/Units'
import T from 'Components/i18n/T'

import TrezorInstructions from './TrezorInstructions';

export default compose(
  setDisplayName('TrezorEthInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs: [{ amount, address }], asset: { symbol, ERC20 }, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[(
    <span key='1'>
      <T tag='span' i18nKey='app.trezorETHInstructions.send'>Send</T> <br/>
      <Units value={amount} symbol={symbol} precision={null}/><br/>
      <T tag='span' i18nKey='app.trezorETHInstructions.to'>to</T> {address.slice(0,12)}<br/>
      {address.slice(12,27)}<br/>
      {address.slice(27)}?
    </span>
  ), (
      <span key='2'>
        <T tag='span' i18nKey='app.trezorETHInstructions.reallySend'>Really send</T> <br/>
        {ERC20 ? 'token' : (<Units value={amount} symbol={symbol} precision={null}/>)} <br/>
        <T tag='span' i18nKey='app.trezorETHInstructions.paying'>paying up to</T> <br/>
        <Units value={feeAmount} symbol={feeSymbol} precision={null}/><br/>
        <T tag='span' i18nKey='app.trezorETHInstructions.forGas'>for gas?</T>
      </span>
    )]}/>
))
