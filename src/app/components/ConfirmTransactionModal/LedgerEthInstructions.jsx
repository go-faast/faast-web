import React from 'react'
import PropTypes from 'prop-types'

import Units from 'Components/Units'

const LedgerScreen = ({ title, value }) => (
  <div className='text-center my-2' style={{ backgroundColor: '#000', color: '#00FFFF' }}>
    <p className='mb-0'>{title}</p>
    <p><b>{value}</b></p>
  </div>
)

const LedgerEthInstructions = ({ swap: { tx: { amount, assetSymbol, toAddress, feeAmount, feeSymbol, feeAsset }}}) => (
  <div>
    <p>Please confirm the transaction on your device. You should see the following information on screen.</p>

    <LedgerScreen title='Amount' value={<Units value={amount} symbol={assetSymbol} precision={null} prefixSymbol/>}/>
    <LedgerScreen title='Address' value={toAddress}/>
    <LedgerScreen title='Maximum fees' value={<Units value={feeAmount} symbol={feeSymbol} precision={null} prefixSymbol/>}/>

    <p><small>
      {'Tip: If you don\'t see the transaction on your device, ensure you\'ve unlocked '
      + `it using your PIN and have opened the ${feeAsset.name} app.`}
    </small></p>
  </div>
)

LedgerEthInstructions.propTypes = {
  swap: PropTypes.object.isRequired,
}

export default LedgerEthInstructions
