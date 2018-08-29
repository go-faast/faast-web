import React from 'react'
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { Table } from 'reactstrap'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { formatDate } from 'Utilities/display'
import routes from 'Routes'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'
import { tradeTable, tradeCoinIcon } from './style'

const TableRow = ({
  swap,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, rate, createdAt },
  ...props
}) => (
  <tr {...props}>
    <td>{createStatusLabel(swap)}</td>
    <td>{formatDate(createdAt, 'yyyy-MM-dd hh:mm:ss')}</td>
    <td><CoinIcon className={tradeCoinIcon} symbol={sendSymbol} size='sm' inline/> {sendSymbol} <i style={{ color: '#777' }} className='fa fa-long-arrow-right'/> <CoinIcon className={tradeCoinIcon} symbol={receiveSymbol} size='sm' inline/> {receiveSymbol}</td>
    <td><Units value={rate} precision={6}/></td>
    <td><Units value={receiveAmount} symbol={receiveSymbol} showSymbol precision={6}/></td>
    <td><Units value={sendAmount} symbol={sendSymbol} showSymbol precision={6}/></td>
  </tr>
)

const TradeTable = ({ swaps, handleClick }) => (
  <Table hover striped responsive className={classNames(tradeTable, 'table-accordian')}>
    <thead>
      <tr>
        <th></th>
        <th>Date</th>
        <th>Pair</th>
        <th>Rate</th>
        <th>Amount Received</th>
        <th>Total Cost</th>
      </tr>
    </thead>
    <tbody>
      {swaps.length === 0 ? (
        <tr className='text-center'>
          <td colSpan='10'>
            <i>No previous trades to show</i>
          </td>
        </tr>
      ) : swaps.map((swap) => !swap.orderId ? null : (
        <TableRow key={swap.orderId} swap={swap} onClick={() => handleClick(swap.orderId)}/>
      ))}
    </tbody>
  </Table>
)

//NOTE: if we end up not filtering out other statuses this approach wont work
const statusInfo = {
  support: {
    icon: <i className='fa fa-exclamation-circle text-warning'></i>,
    expanded: 'There may be an issue. Contact support@faa.st for more info.'
  },
  complete: {
    icon: <i style={{ fontSize: '18px' }} className='text-success fa fa-check-circle'></i>,
    expanded: 'Order Complete'
  },
  processing: {
    icon: <i className='fa fa-spinner fa-pulse'/>,
    expanded: 'Processing'
  }
}

const createStatusLabel = (swap) => {
  const { contactSupport, status: { detailsCode } } = swap
  const { support, complete, processing } = statusInfo
  const status = contactSupport ? support : detailsCode == 'order_complete' ? complete : processing

  return <Expandable shrunk={status.icon} expanded={status.expanded}></Expandable>
}

export default compose(
  setDisplayName('TradeTable'),
  connect(null, {
    push: pushAction
  }),
  setPropTypes({
    swaps: PropTypes.arrayOf(PropTypes.object).isRequired
  }),
  defaultProps({
    swaps: []
  }),
  withHandlers({
    handleClick: ({ push }) => (orderId) => push(routes.tradeDetail(orderId))
  })
)(TradeTable)
