import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import Units from 'Components/Units'
import T from 'Components/i18n/T'

import LedgerInstructions from './LedgerInstructions'

export default compose(
  setDisplayName('LedgerEthInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <LedgerInstructions appName={feeAsset.name} screens={[
    { top: <T tag='span' i18nKey='app.ledgerETHInstructions.amount'>Amount</T>, bottom: (<b><Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/></b>) },
    { top: <T tag='span' i18nKey='app.ledgerETHInstructions.address'>Address</T>, bottom: (<b>{address}</b>) },
    { top: <T tag='span' i18nKey='app.ledgerETHInstructions.maxFees'>Maximum fees</T>, bottom: (<b><Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/></b>) },
  ]}/>
))
