import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { flatMap } from 'lodash'

import Units from 'Components/Units'

import LedgerInstructions from './LedgerInstructions'

export default compose(
  setDisplayName('LedgerBtcInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs, assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <LedgerInstructions appName={feeAsset.name} screens={[
    ...flatMap(outputs, ({ amount, address }, i) => [
      { top: 'Confirm', bottom: `output #${i + 1}` },
      { top: 'Amount', bottom: (<b><Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/></b>) },
      { top: 'Address', bottom: (<b>{address}</b>) },
    ]),
    { top: 'Confirm', bottom: 'transaction' },
    { top: 'Fees', bottom: (<b><Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/></b>) },
  ]}/>
))
