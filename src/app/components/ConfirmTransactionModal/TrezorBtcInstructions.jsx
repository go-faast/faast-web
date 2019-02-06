import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'

import Units from 'Components/Units'
import { convertAddressFormat } from 'Services/Trezor'
import { stripAddressNamespace } from 'Utilities/helpers'

import TrezorInstructions from './TrezorInstructions';

const BITCOIN_ADDRESS_LENGTH = 34

export default compose(
  setDisplayName('TrezorBtcInstructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(({ tx: { outputs, totalSent, assetSymbol, feeAmount, feeSymbol, feeAsset } }) => (
  <TrezorInstructions appName={feeAsset.name} screens={[
    ...outputs.map(({ amount, address }, i) => {
      let formattedAddress = convertAddressFormat(assetSymbol, address)
      formattedAddress = stripAddressNamespace(formattedAddress)
      const splitPoint = Math.floor(formattedAddress.length / 2)
      const addressLines = [formattedAddress.slice(0, splitPoint), formattedAddress.slice(splitPoint)]
      const isLongAddress = formattedAddress.length > BITCOIN_ADDRESS_LENGTH
      return (
        <span key={`output-${i}`}>
          Confirm sending <br/>
          <Units value={amount} symbol={assetSymbol} precision={null}/> to<br/>
          <code className={classNames('text-white', { 'font-xs': isLongAddress })}>
            {addressLines.map((addressLine, i) => (
              <Fragment key={i}>
                {addressLine}
                {(i !== addressLines.length - 1) && (<br/>)}
              </Fragment>
            ))}
          </code>
        </span>
      )
    }), (
      <span key='fee'>
      Really send <br/>
        <Units value={totalSent} symbol={assetSymbol} precision={null}/> <br/>
      from your wallet? <br/>
      Fee included: <br/>
        <Units value={feeAmount} symbol={feeSymbol} precision={null}/>
      </span>
    )]}/>
))
