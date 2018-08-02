import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import Units from 'Components/Units'

import LedgerInstructions from './LedgerInstructions'

export default compose(
  setDisplayName('LedgerEthInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <LedgerInstructions appName={feeAsset.name} screens={[
    { top: 'Confirm', bottom: 'transaction' },
    { top: 'Amount', bottom: (<b><Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/></b>) },
    { top: 'Address', bottom: (<b>{address}</b>) },
    { top: 'Maximum fees', bottom: (<b><Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/></b>) },
  ]}/>
))
