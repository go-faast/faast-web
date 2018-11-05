import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Row, Col, Card, CardBody, CardFooter, Alert, Collapse, Button } from 'reactstrap'
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
import DataLayout from 'Components/DataLayout'

const StatusFooter = ({ className, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', className)} {...props}>
    {children}
  </CardFooter>
)

const priceChange = (date, asset) => {
  const { change1, change7d, change24 } = asset
  // falsey date => hasn't loaded yet so default to 1h change
  date = new Date(date)
  const hoursSinceTrade = !date ? 0 : (Date.now() - date.getTime()) / 3600000
  const timespan = hoursSinceTrade <= 1 ? 'Last 1hr: ' : hoursSinceTrade >= 24 ? 'Last 7d: ' : 'Last 24hrs: '
  var priceChange = hoursSinceTrade <= 1 ? change1 : hoursSinceTrade >= 24 ? change7d : change24
  return (
    <span>{timespan}
      <ChangePercent>{priceChange}</ChangePercent>
      <ArrowIcon 
        className={classNames('swapChangeArrow', priceChange.isZero() ? 'd-none' : null)} 
        size={.58} dir={priceChange < 0 ? 'down' : 'up'} 
        color={priceChange < 0 ? 'danger' : priceChange > 0 ? 'success' : null}
      />
    </span>
  )
}

/* eslint-disable react/jsx-key */
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
    status: { code, details, detailsCode }, createdAt, createdAtFormatted, initializing, isManual
  },
  statusText, showDetails, isExpanded, togglerProps, expanded
}) => {
  const isComplete = code === 'complete'
  const loadingValue = (error
    ? (<span className='text-danger'>-</span>)
    : (<Spinner inline size='sm'/>))
  return (
    <Card className='flat border-0'>
      <CardBody className={`py-2 pr-3 pl-2 ${receiveAmount ? 'lh-0' : 'pt-3 pb-3'}`} {...togglerProps} style={{ minHeight: '4rem' }}>
        <Row className='gutter-0 align-items-center font-size-small text-muted'>
          <Col xs='auto'>
            { expanded === null ? <i style={{ transition: 'all .15s ease-in-out' }} className={classNames('fa fa-chevron-circle-down text-primary px-2 mr-2', { ['fa-rotate-180']: isExpanded })}/> : false }
          </Col>
          <Col>
            <Row className='gutter-2 align-items-center text-center text-sm-left'>
              <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
              <Col xs='12' sm>
                <Row className='gutter-2'>
                  <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{sendAsset.name}</Col>
                  {sendAmount ? (<Col xs='12' className='text-white'>
                    <Units value={sendAmount} symbol={sendSymbol} prefix='-'/>
                  </Col>) : null}
                  {sendAsset ? (<Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, sendAsset)}</Col>)
                  : null}
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
                  <Col xs='12' className='order-sm-2 font-size-sm pt-0'>{receiveAsset ? receiveAsset.name : receiveSymbol}</Col>
                  {receiveAmount ? (<Col xs='12' className='text-white'>
                    <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} prefix='+'/>
                  </Col>) : null}
                  {receiveAsset ? (<Col xs='12' className='mt-0 pt-0 order-sm-3 font-size-xs'>{priceChange(createdAt, receiveAsset)}</Col>)
                  : null}
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
          <DataLayout rows={[
            [
              'Status:',
              <span className={classNames({
                'text-success': isComplete,
                'text-warning': detailsCode === 'contact_support',
                'text-danger': code === 'failed'
              })}>{details}</span>
            ],
            (!isManual || rate) && [
              'Rate:',
              <UnitsLoading value={rate} symbol={sendSymbol} error={error} precision={null} prefix={`1 ${receiveSymbol} = `}/>
            ],
            (txFee || initializing) && [
              'Network fee:',
              <UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} precision={null} showFiat/>
            ],
            hasSwapFee && [
              'Swap fee:',
              <UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} precision={null}/>
            ],
            [
              isComplete ? 'Sent:' : 'Sending:',
              <Fragment>
                <UnitsLoading value={sendAmount} symbol={sendSymbol} error={error} precision={null}/>
                {sendWalletId && (
                  <span className='d-none d-xs-inline ml-2'>
                    <i>using wallet</i> <WalletLabel.Connected id={sendWalletId} tag='span' hideIcon/>
                  </span>
                )}
              </Fragment>
            ],
            [
              isComplete ? 'Received:' : 'Receiving:',
              <Fragment>
                <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} precision={null}/>
                <span className='d-none d-xs-inline ml-2'>
                  {receiveWalletId ? (
                    <Fragment><i>using wallet</i> <WalletLabel.Connected id={receiveWalletId} tag='span' hideIcon/></Fragment>
                  ) : (
                    <Fragment><i>at address</i> {receiveAddress}</Fragment>
                  )}
                </span>
              </Fragment>
            ],
            [
              'Date:',
              !createdAtFormatted ? loadingValue : createdAtFormatted
            ],
            [
              'Order ID:',
              orderId ? orderId : loadingValue
            ],
            txHash && [
              'Sent txn:',
              <Fragment>
                <a href={`${config.explorerUrls[txFeeSymbol]}/tx/${txHash}`} target='_blank' rel='noopener' className='word-break-all mr-2'>{txHash}</a> 
                {!confirmed ? (
                  <i className='fa fa-spinner fa-pulse'/>
                ) : (succeeded ? (
                  <i className='fa fa-check-circle-o text-success'/>
                ) : (
                  <i className='fa fa-exclamation-circle text-danger'/>
                ))}
              </Fragment>
            ]
          ]}/>
        </StatusFooter>
      </Collapse>
    </Card>
  )
})
