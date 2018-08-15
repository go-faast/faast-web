import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'
import Units from 'Components/Units'
import Web3Screen from './Web3Screen'
import { metaMaskIconContainer, wordBreak } from './style'

const Web3Instructions = ({ tx: { outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol } }) => (
    <div>
      <p>Please confirm the transaction. You should see the following information in your MetaMask.</p>
      <p><small>
        {'Tip: If you don\'t see a pop up with your order details, click the MetaMask icon in your browser extension menu as shown'}
        <a href='https://i.imgur.com/Gqn7JUM.mp4' target='_blank' rel='noopener noreferrer'> here.</a>
      </small></p>
      <Web3Screen screens={[
        { left: metaMaskIcon, right: (<span className={classNames('font-weight-bold', wordBreak)}>{address}</span>) },
        { left: 'Amount', right: (<span className='font-weight-bold float-right'><Units value={amount} symbol={assetSymbol} precision={null}/></span>) },
        { left: 'Gas fee', right: (<span className='font-weight-bold float-right'><Units value={feeAmount} symbol={feeSymbol} precision={null}/></span>) }
      ]}/>
    </div>
  )

const metaMaskIcon = (
  <div className={classNames('mr-2', metaMaskIconContainer)}>
    <svg height="100" version="1.1" width="100" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ 'overflow': 'hidden', 'position': 'relative' }}><desc>Created with Raphaël 2.2.0</desc><defs></defs><rect x="0" y="0" width="24" height="24" rx="0" ry="0" fill="#faaf00" stroke="none"></rect><rect x="0" y="0" width="24" height="24" rx="0" ry="0" fill="#fb182b" stroke="none" transform="matrix(-0.4648,0.8854,-0.8854,-0.4648,28.0889,7.3925)"></rect><rect x="0" y="0" width="24" height="24" rx="0" ry="0" fill="#edf500" stroke="none" transform="matrix(0.4821,-0.8761,0.8761,0.4821,-17.5072,9.4322)"></rect><rect x="0" y="0" width="24" height="24" rx="0" ry="0" fill="#2339e1" stroke="none" transform="matrix(0.9245,-0.3813,0.3813,0.9245,12.3723,-5.3729)"></rect></svg>
  </div>
)

export default compose(
  setDisplayName('Web3Instructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(Web3Instructions)
