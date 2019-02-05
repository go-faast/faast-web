import React from 'react'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect' 
import { connect } from 'react-redux'

import Layout from 'Components/Layout'
import TradeTable from 'Components/TradeTable'

import { getConnectedWalletsPendingSwaps, getConnectedWalletsCompletedSwaps, isDefaultPortfolioEmpty } from 'Selectors'

export const tableHeadings = [
  { text: '', mobile: false },
  { text: 'Date', mobile: false },
  { text: 'Pair', mobile: false },
  { text: 'Received', mobile: false },
  { text: 'Cost', mobile: false },
  { text: 'Rate', mobile: false }
]

const TradeHistory = ({ pendingSwaps, completedSwaps }) => (
  <Layout className='pt-3'>
    <h4 className='mt-2 text-primary'>Order History</h4>
    <TradeTable 
      swaps={pendingSwaps} 
      tableTitle='Open Orders' 
      tableHeadings={tableHeadings}
      zeroOrdersMessage='No open orders right now'
    />
    <TradeTable 
      swaps={completedSwaps} 
      tableTitle='Previous Orders' 
      tableHeadings={tableHeadings} 
      zeroOrdersMessage='No previous orders to show'
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
