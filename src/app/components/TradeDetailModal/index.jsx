import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardBody, CardFooter, Button, Modal, ModalBody, ModalHeader } from 'reactstrap'
import classNames from 'class-names'
import { formatDate } from 'Utilities/display'
import ChangePercent from 'Components/ChangePercent'
import config from 'Config'
import { arrowStyle } from './style'
import { getSwap } from 'Selectors/swap'

import ArrowIcon from 'Components/ArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import UnitsLoading from 'Components/UnitsLoading'
import WalletLabel from 'Components/WalletLabel'
import Spinner from 'Components/Spinner'

const StatusFooter = ({ className, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', className)} {...props}>
    {children}
  </CardFooter>
)

const priceChange = (timestamp, asset) => {
  const { change1, change7d, change24 } = asset
  const daysSinceTrade = (Date.now() - timestamp) / 86400000
  const timespan = daysSinceTrade < 1 ? 'Last 24hr: ' : daysSinceTrade >= 2 ? 'Last 7d: ' : 'Last 1d: '
  var priceChangeText = daysSinceTrade < 1 ? change1 : daysSinceTrade >= 2 ? change7d : change24
  return (
    <span>{timespan}<ChangePercent>{priceChangeText}</ChangePercent><ArrowIcon style={arrowStyle} size={.58} dir={priceChangeText < 0 ? 'down' : 'up'} color={priceChangeText < 0 ? 'danger' : 'success'}/></span>
  )
}

export default compose(
  setDisplayName('TradeDetailModal'),
  connect(createStructuredSelector({
    swap: (state, props) => getSwap(state, props.tradeId)
  }), {
  }),
  setPropTypes({
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false
  })
)(({
  swap: {
    sendWalletId, sendSymbol, sendAsset, sendUnits, id,
    receiveWalletId, receiveSymbol, receiveAsset, receiveUnits,
    error, rate, fee: swapFee, hasFee: hasSwapFee,
    tx: { hash: txHash, feeAmount: txFee, feeSymbol: txFeeSymbol, confirmed, succeeded },
    status: { code, label }, orderId,
    order: { created }
  }, isOpen, toggle
}) => (
<Modal key={`modal-${id}`} size='lg' isOpen={isOpen} toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'>
    <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
    Trade Details
    </ModalHeader>
    <ModalBody>
        <Card className='flat'>
            <CardBody className='py-2 pr-3 pl-2 border-0 lh-0' tag={Button} color='ultra-dark' style={{ minHeight: '4rem' }}>
            <Row className='gutter-0 align-items-center font-size-small text-muted'>
                <Col>
                <Row className='gutter-2 align-items-center text-center text-sm-left'>
                    <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
                    <Col xs='12' sm>
                    <Row className='gutter-2'>
                        <Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(created, sendAsset)}</Col> 
                        <Col xs='12' className='order-sm-2 font-size-sm'>{sendAsset.name}</Col>
                        <Col xs='12' className='text-white'>
                        <Units value={sendUnits} symbol={sendSymbol} prefix='-'/>
                        </Col>
                    </Row>
                    </Col>
                </Row>
                </Col>
                <Col xs='auto' className='text-center'>
                <ArrowIcon inline size={1.5} dir='right' color={error ? 'danger' : 'success'}/><br/>
                <small className={classNames('px-2 lh-0', {
                  'text-success': code === 'complete',
                  'text-warning': code === 'failed'
                })}>
                {label}
                </small>
                </Col>
                <Col>
                <Row className='gutter-2 align-items-center text-center text-sm-right'>
                    <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
                    <Col xs='12' sm>
                    <Row className='gutter-2'>
                        <Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(created, receiveAsset)}</Col>
                        <Col xs='12' className='order-sm-2 font-size-sm'>{receiveAsset.name}</Col>
                        <Col xs='12' className='text-white'>
                        <UnitsLoading value={receiveUnits} symbol={receiveSymbol} error={error} prefix='+'/>
                        </Col>
                    </Row>
                    </Col>
                </Row>
                </Col>
            </Row>
            </CardBody>
            <StatusFooter>
            <table style={{ lineHeight: 1.25 }}>
                <tbody>
                <tr>
                    <td><b>Order Date:</b></td>
                    <td colSpan='2' className='px-2'>{formatDate(created, 'yyyy-MM-dd hh:mm:ss')}</td>
                </tr>
                <tr>
                    <td><b>Rate:</b></td>
                    <td colSpan='2' className='px-2'><span>1 {sendSymbol} = </span><UnitsLoading value={rate} symbol={receiveSymbol} error={error} precision={null}/></td>
                </tr>
                <tr>
                    <td><b>Network fee:</b></td>
                    <td colSpan='2' className='px-2'>
                    <UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} precision={null} showFiat/>
                    </td>
                </tr>
                {hasSwapFee && (
                    <tr>
                    <td><b>Swap fee:</b></td>
                    <td colSpan='2' className='px-2'><UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} precision={null}/></td>
                    </tr>
                )}
                <tr>
                    <td><b>Sending:</b></td>
                    <td className='px-2'><UnitsLoading value={sendUnits} symbol={sendSymbol} error={error} precision={null}/></td>
                    <td><i>using wallet</i> <WalletLabel.Connected id={sendWalletId} tag='span' hideIcon/></td>
                </tr>
                <tr>
                    <td><b>Receiving:</b></td>
                    <td className='px-2'><UnitsLoading value={receiveUnits} symbol={receiveSymbol} error={error} precision={null}/></td>
                    <td><i>using wallet</i> <WalletLabel.Connected id={receiveWalletId} tag='span' hideIcon/></td>
                </tr>
                <tr>
                    <td><b>Order ID:</b></td>
                    <td colSpan='2' className='px-2'>{orderId ? orderId : (<Spinner inline size='sm'/>)}</td>
                </tr>
                {txHash && (
                    <tr>
                    <td><b>Sent txn:</b></td>
                    <td colSpan='2' className='px-2'>
                        <a href={`${config.explorerUrls[txFeeSymbol]}/tx/${txHash}`} target='_blank' rel='noopener' className='word-break-all mr-2'>{txHash}</a> 
                        {!confirmed ? (
                        <i className='fa fa-spinner fa-pulse'/>
                        ) : (succeeded ? (
                        <i className='fa fa-check-circle-o text-success'/>
                        ) : (
                        <i className='fa fa-exclamation-circle text-danger'/>
                        ))}
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </StatusFooter>
        </Card>
    </ModalBody>
</Modal>
))
