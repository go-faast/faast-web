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
  swap: { sendUnits, sendSymbol, receiveUnits, receiveSymbol, inverseRate, order: { created }, status: { detailsCode } },
  ...props
}) => (
  <tr {...props}>
    <td>{createStatusLabel(detailsCode)}</td>
    <td>{formatDate(created, 'yyyy-MM-dd hh:mm:ss')}</td>
    <td><CoinIcon className={tradeCoinIcon} symbol={sendSymbol} size='sm' inline/> {sendSymbol} <i style={{ color: '#777' }} className='fa fa-long-arrow-right'/> <CoinIcon className={tradeCoinIcon} symbol={receiveSymbol} size='sm' inline/> {receiveSymbol}</td>
    <td><Units value={inverseRate} symbol={sendSymbol} showSymbol precision={6}/></td>
    <td><Units value={receiveUnits} symbol={receiveSymbol} showSymbol precision={6}/></td>
    <td><Units value={sendUnits} symbol={sendSymbol} showSymbol precision={6}/></td>
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
      ) : swaps.map((swap) => (
        <TableRow key={swap.id} swap={swap} onClick={() => handleClick(swap.id)}/>
      ))}
    </tbody>
  </Table>
)

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
