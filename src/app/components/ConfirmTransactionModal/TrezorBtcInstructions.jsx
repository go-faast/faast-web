import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import Units from 'Components/Units'

import TrezorInstructions from './TrezorInstructions';

export default compose(
  setDisplayName('TrezorBtcInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs, totalSent, assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[
    ...outputs.map(({ amount, address }, i) => (
      <span key={`output-${i}`}>
        Confirm sending <br/>
        <Units value={amount} symbol={assetSymbol} precision={null}/> to<br/>
        {address.slice(0, 17)}<br/>
        {address.slice(17)}?
      </span>
    )), (
    <span key='fee'>
      Really send <br/>
      <Units value={totalSent} symbol={assetSymbol} precision={null}/> <br/>
      from your wallet? <br/>
      Fee included: <br/>
      <Units value={feeAmount} symbol={feeSymbol} precision={null}/>
    </span>
  )]}/>
))
