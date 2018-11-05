import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

import { toBigNumber } from 'Utilities/convert'
import Units from 'Components/Units'
import DataLayout from 'Components/DataLayout'

/* eslint-disable react/jsx-key */
const EthereumInstructions = ({
  tx: {
    outputs: [{ amount, address }], assetSymbol, txData
  }
}) => (
  <div>
    <p>Sending <Units value={amount} precision={8} symbol={assetSymbol}/> to <span className='text-monospace'>{address}</span>.</p>
    <p>Please confirm the following transaction details when prompted by your wallet.</p>
    <DataLayout rows={[
      ['To:', <Fragment><span className='text-monospace'>{txData.to}</span> {assetSymbol !== 'ETH' && (<i>({assetSymbol} contract)</i>)}</Fragment>],
      ['Value:', <Units value={txData.value} precision={null} symbol={'ETH'}/>],
      ['Gas:', <Units value={txData.gas} maxDigits={null}/>],
      ['Gas price:', <Units value={toBigNumber(txData.gasPrice).div(1e9)} maxDigits={null} symbol={'GWei'}/>],
      ['Data:', <span className='text-monospace'>{txData.data}</span>],
    ]}/>
  </div>
)

export default compose(
  setDisplayName('EthereumInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(EthereumInstructions)
