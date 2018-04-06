import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { connect } from 'react-redux'
import { Row, Col, Card, CardBody, CardFooter, Alert } from 'reactstrap'
import classNames from 'class-names'

import { getWallet } from 'Selectors'

import ArrowIcon from 'Components/ArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import UnitsLoading from 'Components/UnitsLoading'

const StatusFooter = ({ className, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', className)} {...props}>
    {children}
  </CardFooter>
)

export default compose(
  setDisplayName('SwapStatusCard'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool,
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false,
  }),
  connect((state, { swap }) => ({
    sendWallet: getWallet(state, swap.sendWalletId),
    receiveWallet: getWallet(state, swap.receiveWalletId),
  }))
)(({
  sendWallet, receiveWallet,
  swap: {
    sendSymbol, sendAsset, sendUnits, receiveSymbol, receiveAsset, receiveUnits,
    error, friendlyError, rate, fee: swapFee, tx: { feeAmount: txFee, feeAsset: txFeeSymbol, },
    status: { details },
  },
  statusText, showWalletLabels, showFees, showDetails, 
}) => (
  <Card className={classNames('flat lh-0')}>
    <CardBody className='py-2 px-3'>
      <Row className='gutter-0 align-items-center font-size-small text-muted'>
        <Col>
          <Row className='gutter-2 align-items-center text-center text-sm-left'>
            {showWalletLabels && (
              <Col xs='12' className='font-size-sm'>{sendWallet.label}</Col>
            )}
            <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
            <Col xs='12' sm>
              <Row className='gutter-2'>
                <Col xs='12' className='order-sm-2 font-size-sm'>{sendAsset.name}</Col>
                <Col xs='12' className='text-white'>
                  <Units value={sendUnits} symbol={sendSymbol}/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col xs='auto' className='text-center'>
          <ArrowIcon block size='md' className='m-auto' dir='right' color={error ? 'danger' : 'success'}/>
          <small>{statusText}</small>
        </Col>
        <Col>
          <Row className='gutter-2 align-items-center text-center text-sm-right'>
            {showWalletLabels && (
              <Col xs='12' className='font-size-sm'>{receiveWallet.label}</Col>
            )}
            <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
            <Col xs='12' sm>
              <Row className='gutter-2'>
                <Col xs='12' className='order-sm-2 font-size-sm'>{receiveAsset.name}</Col>
                <Col xs='12' className='text-white'>
                  <UnitsLoading value={receiveUnits} symbol={receiveSymbol} error={error}/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </CardBody>
    {showFees && (
      <StatusFooter className='text-muted'>
        <Row className='gutter-2'>
          <Col xs='6' sm>
            <span className='mr-2'>txn fee</span>
            <UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} />
          </Col>
          <Col xs='12' sm='auto' className='text-center order-3 order-sm-2'>
            <span>1 {sendSymbol} = </span>
            <UnitsLoading value={rate} symbol={receiveSymbol} error={error} />
          </Col>
          <Col xs='6' sm className='text-right order-2 order-sm-3'>
            <span className='mr-2'>swap fee</span>
            <UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} />
          </Col>
        </Row>
      </StatusFooter>
    )}
    {error 
      ? (<StatusFooter tag={Alert} color='danger' className='m-0 text-center'>{friendlyError || error}</StatusFooter>)
      : (showDetails && details && (
          <StatusFooter className='text-center text-muted'>{details}</StatusFooter>
        ))}
  </Card>
))
