import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Col, Card, CardBody, CardFooter, Alert, Collapse, Button } from 'reactstrap'
import classNames from 'class-names'
import config from 'Config'
import withToggle from '../hoc/withToggle'

import UnitsLoading from 'Components/UnitsLoading'
import WalletLabel from 'Components/WalletLabel'
import Spinner from 'Components/Spinner'
import DataLayout from 'Components/DataLayout'
import SwapStatus from 'Components/SwapStatus'

const StatusFooter = ({ className, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', className)} {...props}>
    {children}
  </CardFooter>
)

/* eslint-disable react/jsx-key */
export default compose(
  setDisplayName('SwapStatusCard'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool,
    expanded: PropTypes.bool,
    showShortStatus: PropTypes.bool,
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
    togglerProps: expanded === null ? { tag: Button, color: 'ultra-dark', onClick: toggleExpandedState } : {},
  }))
)(({
  swap, showShortStatus, showDetails, isExpanded, togglerProps, expanded
}) => {
  const {
    orderId, sendWalletId, sendSymbol, sendAmount,
    receiveWalletId, receiveSymbol, receiveAmount, receiveAddress,
    error, friendlyError, rate, fee: swapFee, hasFee: hasSwapFee,
    tx: { confirmed, succeeded, hash: txHash, feeAmount: txFee, feeSymbol: txFeeSymbol },
    status: { code, details, detailsCode }, createdAtFormatted, initializing, isManual
  } = swap
  const isComplete = code === 'complete'
  const loadingValue = (error
    ? (<span className='text-danger'>-</span>)
    : (<Spinner inline size='sm'/>))
  return (
    <Card className='flat'>
      <CardBody
        className={classNames('py-2 pr-3 pl-2 border-0 lh-0', { 'py-3': !receiveAmount && !sendAmount })}
        style={{ minHeight: '4rem' }}
        {...togglerProps}>
        <SwapStatus swap={swap}
          className='align-items-center'
          showShortStatus={showShortStatus}
          before={expanded === null && (
            <Col xs='auto'>
              <i style={{ transition: 'all .15s ease-in-out' }} className={classNames('fa fa-chevron-circle-down text-primary px-2 mr-2', { ['fa-rotate-180']: isExpanded })}/>
            </Col>
          )}
        />
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
                <a href={`${config.explorerUrls[txFeeSymbol]}/tx/${txHash}`} target='_blank' rel='noopener noreferrer' className='word-break-all mr-2'>{txHash}</a> 
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
