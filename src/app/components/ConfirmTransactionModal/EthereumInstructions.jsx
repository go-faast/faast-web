import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import { toBigNumber } from 'Utilities/convert'
import Units from 'Components/Units'
import DataLayout from 'Components/DataLayout'
import T from 'Components/i18n/T'

/* eslint-disable react/jsx-key */
const EthereumInstructions = ({
  tx: {
    outputs: [{ amount, address }], assetSymbol, txData
  }
}) => (
  <div>
    <T tag='p' i18nKey='app.ethInstructions.sending'>Sending <Units value={amount} precision={8} symbol={assetSymbol}/> to <span className='text-monospace'>{address}</span>.</T>
    <T tag='p' i18nKey='app.ethInstructions.confirm'>Please confirm the following transaction details when prompted by your wallet.</T>
    <DataLayout rows={[
      [<T tag='span' i18nKey='app.ethInstructions.to'>To:</T>, <Fragment><span className='text-monospace'>{txData.to}</span> {assetSymbol !== 'ETH' && (<i>({assetSymbol} contract)</i>)}</Fragment>],
      [<T tag='span' i18nKey='app.ethInstructions.value'>Value:</T>, <Units value={txData.value} precision={null} symbol={'ETH'}/>],
      [<T tag='span' i18nKey='app.ethInstructions.gas'>Gas:</T>, <Units value={txData.gas} maxDigits={null}/>],
      [<T tag='span' i18nKey='app.ethInstructions.gasPrice'>Gas price:</T>, <Units value={toBigNumber(txData.gasPrice).div(1e9)} maxDigits={null} symbol={'GWei'}/>],
      [<T tag='span' i18nKey='app.ethInstructions.data'>Data:</T>, <span className='text-monospace'>{txData.data}</span>],
    ]}/>
  </div>
)

export default compose(
  setDisplayName('EthereumInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(EthereumInstructions)
