import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import { toNumber } from 'Utilities/convert'
import { ellipsize } from 'Utilities/display'
import Units from 'Components/Units'
import {
  metaMaskContainer, metaMaskAddressRow, metaMaskArrow,
  metaMaskTransfer, metaMaskNonce, metaMaskAmountRow,
  metaMaskFeeRow,
} from './style'
import arrowRight from 'Img/metamask-arrow-right.svg'

const ETH_SYMBOL = '♦'

const unitProps = (symbol) => symbol === 'ETH' ? { symbol: ETH_SYMBOL, prefixSymbol: true } : { symbol }

const Web3Instructions = ({
  tx: {
    outputs: [{ amount, address }], assetSymbol, feeAmount, feeSymbol, txData, totalSent
  }
}) => (
  <div>
    <p>Please confirm the transaction. You should see the following information in your MetaMask.</p>
    <p><small>
      {'Tip: If you don\'t see a pop up with your order details, click the MetaMask icon in your browser extension menu as shown'}
      <a href='https://i.imgur.com/Gqn7JUM.mp4' target='_blank' rel='noopener noreferrer'> here.</a>
    </small></p>
    <div className={metaMaskContainer}>
      <Row className={classNames('no-gutters justify-content-center align-items-center', metaMaskAddressRow)}>
        <Col>
          My Wallet
        </Col>
        <Col xs='auto'>
          <div className={metaMaskArrow}>
            <img height="15" width="15" src={arrowRight}/>
          </div>
        </Col>
        <Col className='text-right'>
          {ellipsize(address.toLowerCase(), 6, 4)}
        </Col>
      </Row>
      <div className={metaMaskAmountRow}>
        <div>
          <div className={classNames('font-size-xs', metaMaskTransfer)}>{assetSymbol === 'ETH' ? 'Confirm' : 'Transfer'}</div>
          <div className={classNames('float-right', metaMaskNonce)}>#{toNumber(txData.nonce)}</div>
        </div>
        <h2 className='font-weight-bold my-2'>
          <Units value={amount} precision={6} roundingType='dp' {...unitProps(assetSymbol)}/>
        </h2>
      </div>
      <div className={metaMaskFeeRow}>
        <div>
          GAS FEE
          <span className='font-weight-bold float-right'>
            <Units value={feeAmount} precision={6} roundingType='dp' {...unitProps(feeSymbol)}/>
          </span>
        </div>
        <div>
          TOTAL
          <span className='font-weight-bold float-right'>
            {assetSymbol === 'ETH' ? (
              <Units value={totalSent} precision={6} roundingType='dp' {...unitProps(assetSymbol)}/>
            ) : (
              <Fragment>
                <Units value={amount} precision={6} roundingType='dp' {...unitProps(assetSymbol)}/>
                {' + '}
                <Units value={feeAmount} precision={6} roundingType='dp' {...unitProps(feeSymbol)}/>
              </Fragment>
            )}
          </span>
        </div>
      </div>
    </div>
  </div>
)

export default compose(
  setDisplayName('Web3Instructions'),
  setPropTypes({
    tx: PropTypes.object.isRequired,
  })
)(Web3Instructions)
