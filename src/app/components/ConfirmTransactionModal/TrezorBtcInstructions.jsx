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
)(({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[
    (<span key="1">Confirm sending <br/><b><Units value={amount} symbol={assetSymbol} precision={null}/></b><br/> to <b className="wordBreak">{address}</b>?</span>),
    (<span key="2">Really send <br/> <b><Units value={amount} symbol={assetSymbol} precision={null}/></b> <br/>from your wallet? <br/>Fee included: <br/><b><Units value={feeAmount} symbol={feeSymbol} precision={null}/></b></span>)
  ]}/>
))