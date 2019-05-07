import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { flatMap } from 'lodash'

import Units from 'Components/Units'
import T from 'Components/i18n/T'

import LedgerInstructions from './LedgerInstructions'

export default compose(
  setDisplayName('LedgerBtcInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs, assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <LedgerInstructions appName={feeAsset.name} screens={[
    ...flatMap(outputs, ({ amount, address }, i) => [
      { top: <T tag='span' i18nKey='app.ledgerBTCInstructions.confirm'>Confirm</T>, bottom: <T tag='span' i18nKey='app.ledgerBTCInstructions.output'>output #{i + 1}</T> },
      { top: <T tag='span' i18nKey='app.ledgerBTCInstructions.amount'>Amount</T>, bottom: (<b><Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/></b>) },
      { top: <T tag='span' i18nKey='app.ledgerBTCInstructions.address'>Address</T>, bottom: (<b>{address}</b>) },
    ]),
    { top: <T tag='span' i18nKey='app.ledgerBTCInstructions.confirm'>Confirm</T>, bottom: <T tag='span' i18nKey='app.ledgerBTCInstructions.transaction'>transaction</T> },
    { top: <T tag='span' i18nKey='app.ledgerBTCInstructions.fees'>Fees</T>, bottom: (<b><Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/></b>) },
  ]}/>
))
