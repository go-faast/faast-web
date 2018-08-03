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
    { top: 'Send', bottom: (<b><Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/></b>) },
    { top: 'to', bottom: (<b>{address}</b>) },
    { top: 'with fees up to', bottom: (<b><Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/></b>) },
  ]}/>
))