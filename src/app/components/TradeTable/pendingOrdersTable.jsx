import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect' 
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { Table, Card, CardHeader } from 'reactstrap'
import { compose, setDisplayName, withHandlers, defaultProps, setPropTypes } from 'recompose'
import classNames from 'class-names'
import PropTypes from 'prop-types'
import { getConnectedWalletsPendingSwaps } from 'Selectors'

import routes from 'Routes'
import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'

import { tradeTable, tradeCoinIcon } from './style'

const NODATA = '-----'

const CoinSymbol = ({ symbol, ...props }) => (
  <Fragment>
    <CoinIcon className={classNames(tradeCoinIcon, 'mr-1')} symbol={symbol} size='sm' inline {...props}/>
    {symbol}
  </Fragment>
)

const TableRow = ({
  swap,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, rate, createdAtFormatted },
  ...props
}) => (
  <tr className='cursor-pointer' {...props}>
    <td>{createStatusLabel(swap)}</td>
    <td className='d-none d-sm-table-cell'>{createdAtFormatted}</td>
    <td className='d-none d-sm-table-cell'>
      <CoinSymbol symbol={sendSymbol}/>
      <i className='fa fa-long-arrow-right text-grey mx-2'/> 
      <CoinSymbol symbol={receiveSymbol}/>
    </td>
    <td>{receiveAmount
      ? (<Units value={receiveAmount} symbol={receiveSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
      : NODATA}
    </td>
    <td>{sendAmount
      ? (<Units value={sendAmount} symbol={sendSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
      : NODATA}
    </td>
    <td>{rate > 0
      ? (<Units value={rate} precision={6}/>)
      : NODATA}
    </td>
  </tr>
)

const PendingOrderTable = ({ handleClick, pendingSwaps, hideIfNone }) => (
  <Fragment>
    {hideIfNone && pendingSwaps.length == 0 ? null : (
      <Card className='my-3'>
        <CardHeader>
          <h5>Open Orders</h5>
        </CardHeader>
        <div className='p-2'>
          <Table hover striped responsive className={tradeTable}>
            <thead>
              <tr>
                <th className='border-0'></th>
                <th className='d-none d-sm-table-cell border-0'>Date</th>
                <th className='d-none d-sm-table-cell border-0'>Pair</th>
                <th className='border-0'>Received</th>
                <th className='border-0'>Cost</th>
                <th className='border-0'>Rate</th>
              </tr>
            </thead>
            <tbody>
              {pendingSwaps.length === 0 ? (
                <tr className='text-center'>
                  <td colSpan='10'>
                    <i>No open orders right now</i>
                  </td>
                </tr>
              ) : pendingSwaps.map((swap) => !swap.orderId ? null : (
                <TableRow key={swap.orderId} swap={swap} onClick={() => handleClick(swap.orderId)}/>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    )}
  </Fragment>
)


const statusIcons = {
  contact_support: <i className='fa fa-exclamation-circle text-warning'></i>,
  pending: <i className='fa fa-spinner fa-pulse'/>,
  failed: <i className='fa fa-exclamation-circle text-danger'></i>
}

const createStatusLabel = (swap) => {
  const { status: { detailsCode, code, details } } = swap
  const statusIcon = statusIcons[detailsCode] || statusIcons[code]

  return <Expandable shrunk={statusIcon} expanded={details}></Expandable>
}

export default compose(
  setDisplayName('PendingOrderTable'),
  setPropTypes({
    hideIfNone: PropTypes.bool
  }),
  defaultProps({
    hideIfNone: false,
  }),
  connect(createStructuredSelector({
    pendingSwaps: getConnectedWalletsPendingSwaps
  }), {
    push: pushAction
  }),
  withHandlers({
    handleClick: ({ push }) => (orderId) => push(routes.tradeDetail(orderId))
  })
)(PendingOrderTable)
