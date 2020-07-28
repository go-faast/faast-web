import React, { Fragment } from 'react'
import * as qs from 'query-string'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withProps, lifecycle } from 'recompose'
import { Table, Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { createStatusLabel } from 'Components/TradeTable'
import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import Paginator from 'Components/Paginator'
import Loading from 'Components/Loading'

import { getAffiliateWithdrawals } from 'Actions/affiliate'

import { ellipsize } from 'Utilities/display'

import { getAffiliateWithdrawalsArray, affiliateId, secretKey, 
  getTotalWithdrawals, areWithdrawalsLoading } from 'Selectors/affiliate'

import { text, affilateTable, card, cardHeader, cardFooter, smallCard } from './style'

const WithdrawalTableRow = ({
  withdrawal, 
  withdrawal: { created_at, withdrawal_address, withdrawal_amount = 0, 
    withdrawal_currency = 'BTC', status, transaction_ids },
  size,
  ...props
}) => {
  if (status == 'paid' || status == 'complete') { withdrawal.status = { detailsCode: 'complete', details: 'Paid' } } 
  if (status == 'pending') { withdrawal.status = { detailsCode: 'pending', details: 'Pending' } }
  if (status == 'error') { withdrawal.status = { detailsCode: 'failed', details: 'Error' } }
  return (
    <tr {...props}>
      <td>{createStatusLabel(withdrawal)}</td>
      {size === 'large' && (<td>{created_at}</td>)}
      <td>
        <Expandable shrunk={ellipsize(withdrawal_address, 15, 3)} expanded={withdrawal_address} />
      </td>
      <td>
        <Units value={withdrawal_amount} symbol={withdrawal_currency} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
      </td>
      <td>
        {transaction_ids.length == 1 ? (
          <a href={`https://www.blockchain.com/btc/tx/${transaction_ids[0]}`} target='_blank noreferrer'>View</a>
        ) : transaction_ids.length > 1 ? (
          transaction_ids.map((t,i) => (
            <a style={{ marginRight: 1 }} key={t} href={`https://www.blockchain.com/btc/tx/${t}`} target='_blank noreferrer'>{i + 1}</a>
          ))
        ) : <span style={{ opacity: .6, cursor: 'default' }}>View</span>}
      </td>
    </tr>
  )
}

const AffiliateWithdrawalTable = ({ withdrawals, size, currentPage, handlePageClick, withdrawalHistoryTotal, areWithdrawalsLoading, title }) => {
  withdrawals = size === 'small' ? withdrawals.slice(0,9) : withdrawals
  return (
    <Fragment>
      <Card className={classNames(card, size === 'small' && smallCard, size != 'small' && 'mx-auto')}>
        <CardHeader className={cardHeader}>{title}</CardHeader>
        <CardBody className={classNames(withdrawals.length > 0 && 'p-0', 'text-center')}>
          {areWithdrawalsLoading ? (<Loading className='py-4' />) : withdrawals.length > 0 ? (
            <Fragment>
              <Table className={classNames('text-left', text, affilateTable)} striped responsive>
                <thead>
                  <tr>
                    <th></th>
                    {size === 'large' && (<th>Created</th>)}
                    <th>Wallet</th>
                    <th>Amount</th>
                    <th>Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal, i) => {
                    return (
                      <WithdrawalTableRow key={i} size={size} withdrawal={withdrawal}/>
                    )
                  })}
                </tbody>
              </Table>
              {size === 'small' && withdrawals.length > 0 && (
                <CardFooter 
                  tag={Link} 
                  to='/affiliates/withdrawals'
                  className={classNames(cardFooter, text, withdrawals.length < 9 && 'position-absolute', 'p-2 text-center cursor-pointer d-block w-100')}
                  style={{ bottom: 0 }}
                >
                  <span className='font-weight-bold'>View Withdrawal History</span>
                </CardFooter>)}
            </Fragment>
          ) :
            <div className='d-flex align-items-center justify-content-center'>
              <p className={text}>No Withdrawals yet.</p>
            </div>
          }
          
        </CardBody>
      </Card>
      {size === 'large' && withdrawalHistoryTotal > 1 && (
        <Paginator 
          className='mt-3'
          onPageClick={handlePageClick} 
          page={currentPage} 
          pages={Math.ceil(withdrawalHistoryTotal / 20)}
          theme='light'
        />
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateWithdrawalTable'),
  connect(createStructuredSelector({
    withdrawals: getAffiliateWithdrawalsArray,
    areWithdrawalsLoading,
    withdrawalHistoryTotal: getTotalWithdrawals,
    affiliateId,
    secretKey,
  }), {
    getAffiliateWithdrawals
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
    let title = currentPage > 1 ? (<span>Recent Withdrawals - Page {currentPage}</span>) : 'Recent Withdrawals'
    return ({
      currentPage,
      title
    })
  }),
  withHandlers({
    handlePageClick: ({ getAffiliateWithdrawals, affiliateId, secretKey }) => (page) => {
      getAffiliateWithdrawals(affiliateId, secretKey, page)
    },
  }),
  lifecycle({
    componentWillMount() {
      const { getAffiliateWithdrawals, affiliateId, secretKey, currentPage } = this.props
      getAffiliateWithdrawals(affiliateId, secretKey, currentPage)
    }
  })
)(AffiliateWithdrawalTable)
