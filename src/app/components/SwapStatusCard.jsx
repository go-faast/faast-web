import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Row, Col, Card, CardBody, CardFooter, Alert, Collapse, Button } from 'reactstrap'
import { formatDate } from 'Utilities/display'
import classNames from 'class-names'
import config from 'Config'
import withToggle from '../hoc/withToggle'

import ChangePercent from 'Components/ChangePercent'
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

const priceChange = (date, asset) => {
  const { change1, change7d, change24 } = asset
  // falsey date => hasn't loaded yet so default to 1h change
  const hoursSinceTrade = !date ? 0 : (Date.now() - date.getTime()) / 3600000
  const timespan = hoursSinceTrade <= 1 ? 'Last 1hr: ' : hoursSinceTrade >= 24 ? 'Last 7d: ' : 'Last 24hrs: '
  var priceChangeText = hoursSinceTrade <= 1 ? change1 : hoursSinceTrade >= 24 ? change7d : change24
  return (
    <span>{timespan}<ChangePercent>{priceChangeText}</ChangePercent><ArrowIcon className="swapChangeArrow" size={.58} dir={priceChangeText < 0 ? 'down' : 'up'} color={priceChangeText < 0 ? 'danger' : 'success'}/></span>
  )
}

export default compose(
  setDisplayName('SwapStatusCard'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool,
    expanded: PropTypes.bool
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false,
    expanded: null
  }),
  withToggle('expandedState'),
  withProps(({ expanded, isExpandedState, toggleExpandedState }) => ({
    isExpanded: expanded === null ? isExpandedState : expanded,
    togglerProps: expanded === null ? { tag: Button, color: 'ultra-dark', onClick: toggleExpandedState } : {}
  }))
)(({
  swap: {
    orderId, sendWalletId, sendSymbol, sendAsset, sendAmount,
    receiveWalletId, receiveSymbol, receiveAsset, receiveAmount, receiveAddress,
    error, friendlyError, rate, fee: swapFee, hasFee: hasSwapFee,
    tx: { confirmed, succeeded, hash: txHash, feeAmount: txFee, feeSymbol: txFeeSymbol },
    status: { code, details }, createdAt, initializing,
  },
  statusText, showDetails, isExpanded, togglerProps, expanded
}) => {
  const loadingValue = (error
    ? (<span className='text-danger'>-</span>)
    : (<Spinner inline size='sm'/>))
  return (
    <Card className='flat'>
      <CardBody className='py-2 pr-3 pl-2 border-0 lh-0' {...togglerProps} style={{ minHeight: '4rem' }}>
        <Row className='gutter-0 align-items-center font-size-small text-muted'>
          <Col xs='auto'>
            { expanded === null ? <i style={{ transition: 'all .15s ease-in-out' }} className={classNames('fa fa-chevron-circle-down text-primary px-2 mr-2', { ['fa-rotate-180']: isExpanded })}/> : false }
          </Col>
          <Col>
            <Row className='gutter-2 align-items-center text-center text-sm-left'>
              <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
              <Col xs='12' sm>
                <Row className='gutter-2'>
                  <Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, sendAsset)}</Col>
                  <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{sendAsset.name}</Col>
                  <Col xs='12' className='text-white'>
                    <Units value={sendAmount} symbol={sendSymbol} prefix='-'/>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col xs='auto' className='text-center'>
            <ArrowIcon inline size={1.5} dir='right' color={error ? 'danger' : 'success'}/><br/>
            <small className='lh-0'>{statusText}</small>
          </Col>
          <Col>
            <Row className='gutter-2 align-items-center text-center text-sm-right'>
              <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
              <Col xs='12' sm>
                <Row className='gutter-2'>
                  <Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, receiveAsset)}</Col>
                  <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{receiveAsset.name}</Col>
                  <Col xs='12' className='text-white'>
                    <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} prefix='+'/>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardBody>
      {error 
        ? (<StatusFooter tag={Alert} color='danger' className='m-0 text-center'>{friendlyError || error}</StatusFooter>)
        : (showDetails && details && (
            <StatusFooter className='text-center text-muted'>{details}</StatusFooter>
          ))}
      <Collapse isOpen={isExpanded}>
        <StatusFooter>
          <table style={{ lineHeight: 1.25 }}>
            <tbody>
              <tr>
                <td><b>Status:</b></td>
                <td colSpan='2' className={classNames('px-2', {
                  'text-success': code === 'complete',
                  'text-warning': code === 'failed'
                })}>
                  {details}
                </td>
              </tr>
              <tr>
                <td><b>Rate:</b></td>
                <td colSpan='2' className='px-2'>
                  <UnitsLoading value={rate} symbol={sendSymbol} error={error} precision={null} prefix={`1 ${receiveSymbol} = `}/>
                </td>
              </tr>
              { (txFee || initializing) && (
                <tr>
                  <td><b>Network fee:</b></td>
                  <td colSpan='2' className='px-2'>
                    <UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} precision={null} showFiat/>
                  </td>
                </tr>
              )}
              {hasSwapFee && (
                <tr>
                  <td><b>Swap fee:</b></td>
                  <td colSpan='2' className='px-2'><UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} precision={null}/></td>
                </tr>
              )}
              <tr>
                <td><b>Sending:</b></td>
                <td className='px-2'><UnitsLoading value={sendAmount} symbol={sendSymbol} error={error} precision={null}/></td>
                { sendWalletId ? (
                  <td><i>using wallet</i> <WalletLabel.Connected id={sendWalletId} tag='span' hideIcon/></td>
                ) : null}
              </tr>
              <tr>
                <td><b>Receiving:</b></td>
                <td className='px-2'><UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} precision={null}/></td>
                { receiveWalletId ? (
                  <td><i>using wallet</i> <WalletLabel.Connected id={receiveWalletId} tag='span' hideIcon/></td>
                ) : (
                  <td><i>at address</i> {receiveAddress}</td>
                )}
              </tr>
              <tr>
                <td><b>Date Created:</b></td>
                <td colSpan='2' className='px-2'>{createdAt
                  ? formatDate(createdAt, 'yyyy-MM-dd hh:mm:ss')
                  : loadingValue}
                </td>
              </tr>
              <tr>
                <td><b>Order ID:</b></td>
                <td colSpan='2' className='px-2'>{orderId ? orderId : loadingValue}</td>
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
      </Collapse>
    </Card>
  )
})
