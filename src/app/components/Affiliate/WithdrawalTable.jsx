import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { Table, Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { createStatusLabel } from 'Components/TradeTable'
import Units from 'Components/Units'
import Expandable from 'Components/Expandable'

import { ellipsize } from 'Utilities/display'

import { getAffiliateWithdrawalsArray } from 'Selectors'

import { text, affilateTable, card, cardHeader, cardFooter, smallCard } from './style'

const WithdrawalTableRow = ({
  withdrawal, size,
  withdrawal: { created, address, amount, currency, status, tx_hash },
  ...props
}) => {
  if (status == 'paid') { withdrawal.status = { detailsCode: 'complete', details: 'Paid' } } 
  if (status == 'pending') { withdrawal.status = { detailsCode: 'pending', details: 'Pending' } }
  return (
    <tr className='cursor-pointer' {...props}>
      <td>{createStatusLabel(withdrawal)}</td>
      {size == 'large' ? (<td>{created}</td>) : null}
      <td>
        <Units value={amount} symbol={currency} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>
      </td>
      <td>
        <Expandable shrunk={ellipsize(address, 15, 3)} expanded={address} />
      </td>
      <td>
        {tx_hash ? (
          <a href={`https://www.blockchain.com/btc/tx/${tx_hash}`} target='_blank noreferrer'>View</a>
        ) : <span style={{ opacity: .6, cursor: 'default' }}>------</span>}
      </td>
    </tr>
  )
}

const AffiliateWithdrawalTable = ({ withdrawals, size }) => {
  withdrawals = size === 'small' ? withdrawals.slice(0,9) : withdrawals
  return (
    <Fragment>
      <Card className={classNames(card, size === 'small' && smallCard, size != 'small' && 'mx-auto')}>
        <CardHeader className={cardHeader}>Recent Withdrawals</CardHeader>
        <CardBody className={classNames(withdrawals.length > 0 && 'p-0', 'text-center')}>
          {withdrawals.length > 0 ? (
            <Table className={classNames('text-left', text, affilateTable)} striped responsive>
              <thead>
                <tr>
                  <th></th>
                  {size === 'large' ? (<th>Date</th>) : null}
                  <th>Amount</th>
                  <th>Wallet</th>
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
          ) :
            <div className='d-flex align-items-center justify-content-center'>
              <p className={text}>No withdrawals yet.</p>
            </div>
          }
          {size === 'small' && (<CardFooter 
            tag={Link} 
            to='/affiliates/withdrawals'
            className={classNames(cardFooter, text, 'p-2 text-center cursor-pointer d-block')}
          >
            <span className='font-weight-bold'>View All Withdrawals</span>
          </CardFooter>)}
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateWithdrawalTable'),
  connect(createStructuredSelector({
    withdrawals: getAffiliateWithdrawalsArray,
  }), {
  }),
  setPropTypes({
    size: PropTypes.string
  }),
  defaultProps({
    size: 'large'
  }),
  withHandlers({
  }),
)(AffiliateWithdrawalTable)
