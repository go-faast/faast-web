import React, { Fragment } from 'react'
import * as qs from 'query-string'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps, withHandlers, lifecycle } from 'recompose'
import { Table, Card, CardHeader, CardBody, CardFooter, Row, Col } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { createStatusLabel, CoinSymbol } from 'Components/TradeTable'
import Loading from 'Components/Loading'
import Units from 'Components/Units'
import Paginator from 'Components/Paginator'

import { affiliateSentSwapsArray, areSwapsLoading, swapHistoryTotal, 
  affiliateId, secretKey } from 'Selectors/affiliate'
import { getAffiliateSwaps, getSwapsExportLink } from 'Actions/affiliate'

import { text, affilateTable, card, cardHeader, cardFooter, smallCard } from './style'

const NODATA = '---'

const TableRow = ({
  swap, size,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, createdAtFormatted, rate },
  ...props
}) => (
  <tr {...props}>
    <td><span className='position-relative' style={{ left: 8 }}>{createStatusLabel(swap)}</span></td>
    {size === 'large' && (<td className='d-none d-sm-table-cell'>{createdAtFormatted}</td>)}
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
    {size === 'large' && (
      <td>{rate > 0
        ? (<Units value={rate} precision={6}/>)
        : NODATA}
      </td>
    )}
  </tr>
)

const AffiliateSwapsTable = ({ swaps, size, areSwapsLoading, currentPage, title, 
  swapHistoryTotal, handlePageClick }) => {
  swaps = swaps && size === 'small' ? swaps.slice(0,6) : swaps
  return (
    <Fragment>
      <Card className={classNames(card, size === 'small' && smallCard, size !== 'small' && 'mx-auto')}>
        <CardHeader className={cardHeader}>
          <Row>
            <Col>{title}</Col>
          </Row>
        </CardHeader>
        <CardBody className={classNames(swaps.length > 0 && 'p-0','text-center')}>
          {areSwapsLoading ? (<Loading className='py-4' />) :
            swaps.length > 0 ? (
              <Fragment>
                <Table className={classNames('text-left', text, affilateTable)} striped responsive>
                  <thead>
                    <tr>
                      <th></th>
                      {size === 'large' ? (<th className='d-none d-sm-table-cell'>Date</th>) : null}
                      <th className='d-none d-sm-table-cell'>Pair</th>
                      <th>Received</th>
                      <th>Sent</th>
                      {size === 'large' ? (<th>Rate</th>) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {swaps.map(swap => {
                      return (
                        <TableRow key={swap.orderId} size={size} swap={swap}/>
                      )
                    })}
                  </tbody>
                </Table>
                {size === 'small' && (
                  <CardFooter 
                    tag={Link} 
                    to='/affiliates/swaps'
                    className={classNames(cardFooter, text, swaps.length <= 5 && 'position-absolute', 'p-2 text-center cursor-pointer d-block w-100')}
                    style={{ bottom: 0 }}
                  >
                    <span className='font-weight-bold'>View All Swaps</span>
                  </CardFooter>)}
              </Fragment>) :
              <div className='d-flex align-items-center justify-content-center'>
                <p className={text}>No swaps yet.</p>
              </div>
          }
        </CardBody>
      </Card>
      {size === 'large' && swapHistoryTotal > 1 && (
        <Paginator 
          className='mt-3'
          onPageClick={handlePageClick} 
          page={currentPage} 
          pages={Math.ceil(swapHistoryTotal / 50)}
          theme='light'
        />
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateSwapsTable'),
  connect(createStructuredSelector({
    swaps: affiliateSentSwapsArray,
    areSwapsLoading,
    swapHistoryTotal,
    affiliateId,
    secretKey,
  }), {
    getAffiliateSwaps,
    getSwapsExportLink
  }),
  setPropTypes({
    size: PropTypes.string
  }),
  defaultProps({
    size: 'large'
  }),
  withRouter,
  withProps(({ location }) => {
    const urlParams = qs.parse(location.search)
    let { page: currentPage = 1 } = urlParams
    currentPage = parseInt(currentPage)
    let title = currentPage > 1 ? (<span>Recent Swaps - Page {currentPage}</span>) : 'Recent Swaps'
    return ({
      currentPage,
      title
    })
  }),
  withHandlers({
    handlePageClick: ({ getAffiliateSwaps, affiliateId, secretKey }) => (page) => {
      getAffiliateSwaps(affiliateId, secretKey, page)
    },
  }),
  lifecycle({
    componentWillMount() {
      const { getAffiliateSwaps, affiliateId, secretKey, currentPage } = this.props
      getAffiliateSwaps(affiliateId, secretKey, currentPage)
    }
  })
)(AffiliateSwapsTable)
