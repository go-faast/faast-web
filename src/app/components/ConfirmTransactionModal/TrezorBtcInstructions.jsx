import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { sliceWalletAddress } from 'Utilities/display'
import Units from 'Components/Units'

import TrezorInstructions from './TrezorInstructions';

export default compose(
  setDisplayName('TrezorBtcInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[
    { content: <span>Confirm sending <br/><b><Units value={amount} symbol={assetSymbol} precision={null}/></b><br/> to <b dangerouslySetInnerHTML={sliceWalletAddress(address, 3)}></b>?</span> },
    { content: <span>Really send <b><Units value={amount} symbol={assetSymbol} precision={null}/></b> from your wallet? <br/>Fee included: <b><Units value={feeAmount} symbol={feeSymbol} precision={null}/></b></span> }
  ]}/>
))