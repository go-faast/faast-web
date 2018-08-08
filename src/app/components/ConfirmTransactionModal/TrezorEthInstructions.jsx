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
)(({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[
    (<span key="1">Send <br/><b><Units value={amount} symbol={assetSymbol} precision={null}/></b><br/> to <b>{splitWalletAddress(address)}</b>?</span>),
    (<span key="2">Really send <br/> token <br/> paying up to <br/> <b><Units value={feeAmount} symbol={feeSymbol} precision={null}/></b><br/>for gas?</span>)
  ]}/>
))

const splitWalletAddress = (address) => {
  const line1 = address.slice(0,12)
  const line2 = address.slice(12,27)
  const line3 = address.slice(27, address.length)
  return (
    <span>
      {line1}<br/>
      {line2}<br/>
      {line3}
    </span>
  )
}