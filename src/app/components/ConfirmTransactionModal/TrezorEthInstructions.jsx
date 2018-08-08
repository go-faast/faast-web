import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import Units from 'Components/Units'

import TrezorInstructions from './TrezorInstructions';

export default compose(
  setDisplayName('TrezorEthInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs: [{ amount, address }], asset: { symbol, ERC20 }, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[(
    <span key='1'>
      Send <br/>
      <Units value={amount} symbol={symbol} precision={null}/><br/>
      to {address.slice(0,12)}<br/>
      {address.slice(12,27)}<br/>
      {address.slice(27)}?
    </span>
  ), (
    <span key='2'>
      Really send <br/>
      {ERC20 ? 'token' : (<Units value={amount} symbol={symbol} precision={null}/>)} <br/>
      paying up to <br/>
      <Units value={feeAmount} symbol={feeSymbol} precision={null}/><br/>
      for gas?
    </span>
  )]}/>
))
