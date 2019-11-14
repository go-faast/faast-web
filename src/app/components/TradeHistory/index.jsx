import React from 'react'
import { uniqBy } from 'lodash'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect' 
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'

import Layout from 'Components/Layout'
import TradeTable from 'Components/TradeTable'
import T from 'Components/i18n/T'

import { getConnectedWalletsPendingSwaps, getConnectedWalletsCompletedSwaps, isDefaultPortfolioEmpty } from 'Selectors'

export const tableHeadingsOpen = [
  { text: '', mobile: false },
  { text: <T tag='span' i18nKey='app.orders.date'>Date</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.pair'>Pair</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.receiving'>Receiving</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.cost'>Cost</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.rate'>Rate</T>, mobile: false }
]

export const tableHeadingsCompleted = [
  { text: '', mobile: false },
  { text: <T tag='span' i18nKey='app.orders.date'>Date</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.pair'>Pair</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.received'>Received</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.cost'>Cost</T>, mobile: false },
  { text: <T tag='span' i18nKey='app.orders.rate'>Rate</T>, mobile: false }
]

const TradeHistory = ({ pendingSwaps, completedSwaps }) => (
  <Layout className='pt-3'>
    <Helmet>
      <title>Cryptocurrency Order History - Faa.st</title>
      <meta name='description' content='Keep track of all your previous cryptocurrency trades and swaps, and analyze whether trades were positive or negative.' /> 
    </Helmet>
    <T tag='h4' i18nKey='app.orders.orderHistory' className='mt-2 text-primary'>Order History</T>
    <TradeTable 
      swaps={uniqBy(pendingSwaps, 'orderId')} 
      tableTitle={<T tag='span' i18nKey='app.orders.openOrdersTitle'>Open Orders</T>} 
      tableHeadings={tableHeadingsOpen}
      zeroOrdersMessage={<T tag='span' i18nKey='app.orders.noOpen'>No open orders right now</T>}
    />
    <TradeTable 
      swaps={uniqBy(completedSwaps, 'orderId')} 
      tableTitle={<T tag='span' i18nKey='app.orders.previousOrdersTitle'>Previous Orders</T>} 
      tableHeadings={tableHeadingsCompleted} 
      zeroOrdersMessage={<T tag='span' i18nKey='app.orders.noPrevious'>No previous orders to show</T>}
      showMore
    />
  </Layout>
)

export default compose(
  setDisplayName('TradeHistory'),
  connect(createStructuredSelector({
    pendingSwaps: getConnectedWalletsPendingSwaps,
    completedSwaps: getConnectedWalletsCompletedSwaps,
    hasZeroWallets: isDefaultPortfolioEmpty
  }), {
    push: pushAction,
  }),
  lifecycle({
    componentWillMount() {
      const { hasZeroWallets, push } = this.props
      if (hasZeroWallets && !window.location.pathname.split('/')[3]) {
        push('/connect')
      }
    }
  })
)(TradeHistory)
