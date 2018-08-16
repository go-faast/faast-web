import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'
import Units from 'Components/Units'
import Web3Screen from './Web3Screen'
import { transfer } from './style'

const Web3Instructions = ({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol } }) => (
    <div>
      <p>Please confirm the transaction. You should see the following information in your MetaMask.</p>
      <p><small>
        {'Tip: If you don\'t see a pop up with your order details, click the MetaMask icon in your browser extension menu as shown'}
        <a href='https://i.imgur.com/Gqn7JUM.mp4' target='_blank' rel='noopener noreferrer'> here.</a>
      </small></p>
      <Web3Screen screens={[
        { left: (<div className={'font-weight-bold wordBreak'}>{address}</div>), right: (<small><div className={classNames('mt-2 mb-1 font-size-xs', transfer)}>Transfer</div></small>) },
        { left: 'Amount', right: (<span className='font-weight-bold float-right'><Units value={amount} symbol={assetSymbol} precision={null}/></span>) },
        { left: 'Gas fee', right: (<span className='font-weight-bold float-right'><Units value={feeAmount} symbol={feeSymbol} precision={null}/></span>) }
      ]}/>
    </div>
  )

export default compose(
  setDisplayName('Web3Instructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(Web3Instructions)
