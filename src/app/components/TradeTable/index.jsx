import React from 'react'
import { push as pushAction } from 'react-router-redux'
import { connect } from 'react-redux'
import { Table } from 'reactstrap'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import routes from 'Routes'
import PropTypes from 'prop-types'

import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import { tradeTable } from './style'

const NODATA = '-----'

const TableRow = ({
  swap,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, rate, createdAtFormatted },
  ...props
}) => (
  <tr {...props}>
    <td>{createStatusLabel(swap)}</td>
    <td className='d-none d-xs-table-cell'>{createdAtFormatted}</td>
    <td>{sendAmount
      ? (<Units value={sendAmount} symbol={sendSymbol} showSymbol showIcon precision={6}/>)
      : NODATA}
    </td>
    <td>{receiveAmount
      ? (<Units value={receiveAmount} symbol={receiveSymbol} showSymbol showIcon precision={6}/>)
      : NODATA}
    </td>
    <td>{rate > 0
      ? (<Units value={rate} precision={6}/>)
      : NODATA}
    </td>
  </tr>
)

const TradeTable = ({ swaps, handleClick }) => (
  <Table hover striped responsive className={tradeTable}>
    <thead>
      <tr>
        <th></th>
        <th className='d-none d-xs-table-cell'>Date</th>
        <th>Sent</th>
        <th>Received</th>
        <th>Rate</th>
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


const statusIcons = {
  complete: <i style={{ fontSize: '18px' }} className='text-success fa fa-check-circle'></i>,
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
