import React, { Fragment } from 'react'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Table, Card, CardHeader, CardFooter, Col, Row } from 'reactstrap'
import { compose, setDisplayName, withHandlers, defaultProps, setPropTypes, withState } from 'recompose'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import routes from 'Routes'
import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'

import { areAnyWalletOrdersLoading, areAllWalletOrdersLoaded } from 'Selectors/wallet'
import { retrievePaginatedSwaps } from 'Actions/swap'

import { tradeTable, tradeCoinIcon } from './style'

const NODATA = '-----'

export const CoinSymbol = ({ symbol, showSymbol,  size = 'sm', ...props }) => (
  <Fragment>
    <CoinIcon className={classNames(tradeCoinIcon, 'mr-1')} symbol={symbol} size={size} inline {...props}/>
    {showSymbol ? symbol : null}
  </Fragment>
)

export const TableRow = ({
  swap,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, receiveAsset, sendAsset,
    rate, createdAtFormatted, status: { details } },
  ...props
}) => {
  return (
    <Fragment>
      <tr className='cursor-pointer d-none d-sm-table-row' {...props}>
        <td>{createStatusLabel(swap)}</td>
        <td className='d-none d-sm-table-cell'>{createdAtFormatted}</td>
        <td className='d-none d-sm-table-cell'>
          <CoinSymbol symbol={sendSymbol} showSymbol/>
          <i className='fa fa-long-arrow-right text-grey mx-2'/> 
          <CoinSymbol symbol={receiveSymbol} showSymbol/>
        </td>
        <td>{receiveAmount
          ? (<Units value={receiveAmount} symbol={receiveSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
          : NODATA}
        </td>
        <td>{sendAmount
          ? (<Units value={sendAmount} symbol={sendSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
          : NODATA}
        </td>
        <td className='d-none d-sm-table-cell'>{rate > 0
          ? (<Units value={rate} precision={6}/>)
          : (sendAmount && receiveAmount) ? <Units value={sendAmount.div(receiveAmount)} precision={6}/> 
            : NODATA}
        </td>
      </tr>
      <tr className='cursor-pointer d-table-row d-sm-none' {...props}>
        <td className='py-3'>
          <Row style={{ justifyContent: 'space-between' }} className='gutter-2 align-items-center text-center pb-2'>
            <Col xs='5'>
              <CoinSymbol symbol={sendSymbol} size='md'/>
              <p className='mt-2 mb-0 font-xs'>{sendAsset && sendAsset.name}</p>
              <div className='mt-1 text-muted font-xs'>
                {sendAmount
                  ? (<Units value={sendAmount} precision={6} symbol={sendSymbol} showSymbol/>)
                  : NODATA}
              </div>
            </Col>
            <Col xs='1'>
              <i className='fa fa-long-arrow-right text-grey mx-2'/> 
            </Col>
            <Col xs='5'>
              <CoinSymbol symbol={receiveSymbol} size='md'/>
              <p className='mt-2 mb-0 font-xs'>{receiveAsset && receiveAsset.name}</p>
              <div className='mt-1 text-muted font-xs'>
                {receiveAmount
                  ? (<Units value={receiveAmount} symbol={receiveSymbol} precision={6} showSymbol/>)
                  : NODATA}
              </div>
            </Col>
          </Row>
          <div className='pl-2 ml-1 font-xs mt-2 mb-2'>
            <div className='mt-1'>
              <span style={{ width: 45 }} className='mr-2 d-inline-block'>Status:</span>
              <span>
                {createStatusLabel(swap)} {details}
              </span>
            </div>
            <div className='mt-1'>
              <span style={{ width: 45 }} className='mr-2 d-inline-block'>Date:</span>
              <span>
                {createdAtFormatted}
              </span>
            </div>
            <div className='mt-1'>
              <span style={{ width: 45 }} className='mr-2 d-inline-block'>Rate:</span>
              <span>
                {rate > 0
                  ? (<Units value={rate} precision={6}/>)
                  : (sendAmount && receiveAmount) ? <Units value={sendAmount.div(receiveAmount)} precision={6}/> 
                    : NODATA}
              </span>
            </div>
          </div>
        </td>
      </tr>
    </Fragment>
  )
  
}

const TradeTable = ({ handleClick, hideIfNone, tableTitle, 
  swaps, tableHeadings, zeroOrdersMessage, handleShowMore, areOrdersLoading,
  areAllOrdersLoaded, showMore, classProps }) => (
  <Fragment>
    {hideIfNone && swaps.length == 0 ? null : (
      <Card className={classNames('mb-3', classProps)}>
        <CardHeader>
          <h5>{tableTitle}</h5>
        </CardHeader>
        {swaps.length === 0 ? (
          <p className='text-center mt-3'>
            <i>{zeroOrdersMessage}</i>
          </p>
        ) : (
          <Table hover striped responsive className={tradeTable}>
            <thead>
              <tr>
                {tableHeadings.map(({ text, mobile }) => (
                  <th key={text} className={!mobile ? 'd-none d-sm-table-cell border-0' : 'border-0'}>{text}</th>)
                )}
              </tr>
            </thead>
            <tbody>
              {swaps.map((swap) => !swap.orderId ? null : (
                <TableRow key={swap.orderId} swap={swap} onClick={() => handleClick(swap.orderId)}/>
              ))}
            </tbody>
          </Table>
        )}
        {!areAllOrdersLoaded && showMore && (
          <CardFooter 
            tag='a'
            onClick={handleShowMore}
            className={'position-absolute p-2 text-center cursor-pointer d-block w-100'}
            style={{ bottom: 0 }}
          >
            {!areOrdersLoading ? (
              <span className='hover'>Show more orders...</span>
            ) : (
              <i className='fa fa-spinner fa-pulse'/>
            )}
          </CardFooter>
        )}
      </Card>
    )}
  </Fragment>
)


export const statusIcons = {
  complete: <i className='text-success fa fa-check-circle'></i>,
  contact_support: <i className='fa fa-exclamation-circle text-warning'></i>,
  pending: <i className='fa fa-spinner fa-pulse'/>,
  failed: <i className='fa fa-exclamation-circle text-danger'></i>
}

export const createStatusLabel = (swap) => {
  const { status: { detailsCode, code, details } } = swap
  const statusIcon = statusIcons[detailsCode] || statusIcons[code]

  return <Expandable shrunk={statusIcon} expanded={details}></Expandable>
}

export default compose(
  setDisplayName('TradeTable'),
  setPropTypes({
    hideIfNone: PropTypes.bool,
    tableTitle: PropTypes.string,
    tableHeadings: PropTypes.arrayOf(PropTypes.object),
    zeroOrdersMessage: PropTypes.string,
    swaps: PropTypes.arrayOf(PropTypes.object),
    showMore: PropTypes.bool,
    classProps: PropTypes.string
  }),
  defaultProps({
    tableTitle: 'Orders',
    hideIfNone: false,
    tableHeadings: [],
    zeroOrdersMessage: 'No orders to show',
    swaps: [{}],
    showMore: false,
    classProps: ''
  }),
  connect(createStructuredSelector({
    areOrdersLoading: areAnyWalletOrdersLoading,
    areAllOrdersLoaded: areAllWalletOrdersLoaded,
  }), {
    push: pushAction,
    retrievePaginatedSwaps: retrievePaginatedSwaps
  }),
  withState('page', 'updatePage', 2),
  withHandlers({
    handleClick: ({ push }) => (orderId) => push(routes.tradeDetail(orderId)),
    handleShowMore: ({ page, updatePage, retrievePaginatedSwaps }) => () => {
      retrievePaginatedSwaps(page)
      updatePage(page + 1)
    }
  }),
)(TradeTable)
