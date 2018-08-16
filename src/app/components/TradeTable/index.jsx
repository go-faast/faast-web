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
import { tradeTable } from './style'
import CoinIcon from 'Components/CoinIcon'

const TradeTable = ({ swaps, handleClick }) => {
  return (
    <Table hover striped responsive className={classNames(tradeTable, 'table-accordian')}>
      <thead>
        <tr>
          <th></th>
          <th>Date</th>
          <th>Pair</th>
          <th>Rate</th>
          <th>Amount Received</th>
          <th>Tx Fees</th>
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
      ) : createTableRow(swaps, handleClick)}
      </tbody>
    </Table>
  )
}

const createTableRow = (swaps, handleClick) => {
  swaps.sort(function(a,b) {return (a.order.created < b.order.created) ? 1 : ((b.order.created < a.order.created) ? -1 : 0);})
  return swaps.map(swap => {
    const { 
      id, rate, sendSymbol, receiveUnits, receiveSymbol, order: { created }, tx: { feeAmount, feeSymbol }, status: { detailsCode }
    } = swap
    const inverseRate = (1 / rate)
    const totalPrice = parseFloat((inverseRate * receiveUnits) + feeAmount)
    var tableRow = detailsCode == ('order_complete' || 'processing') ?
     (
      <tr key={id} onClick={() => handleClick(id)}>
        <td>{createStatusLabel(detailsCode)}</td>
        <td>{formatDate(created, 'yyyy-MM-dd hh:mm:ss')}</td>
        <td><CoinIcon symbol={sendSymbol} size='sm' inline/> {sendSymbol} <i style={{ color: '#777' }} className='fa fa-long-arrow-right'/> <CoinIcon symbol={receiveSymbol} size='sm' inline/> {receiveSymbol}</td>
        <td><Units value={inverseRate} symbol={sendSymbol} showSymbol={true} precision={6}/></td>
        <td><Units value={receiveUnits} symbol={receiveSymbol} showSymbol={true} precision={6}/></td>
        <td><Units value={feeAmount} symbol={feeSymbol} showSymbol={true} precision={6}/></td>
        <td><Units value={totalPrice} symbol={sendSymbol} showSymbol={true} precision={6}/></td>
      </tr>
    ) : false

    return tableRow
  })
} 

const createStatusLabel = (status) => {
  const icon = status == 'order_complete' ? (
    <i style={{ fontSize: '18px' }} className='text-success fa fa-check-circle'></i>
  ) : (
    <i className='fa fa-spinner fa-pulse'/>
  )
  return <Expandable shrunk={icon} expanded={status.replace('_',' ')}></Expandable>
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