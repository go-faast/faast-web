import React from 'react'
import { compose, setDisplayName } from 'recompose'

import Layout from 'Components/Layout'
import TradeTable from 'Components/TradeTable'

const TradeHistory = () => (
  <Layout className='pt-3'>
    <h4 className='mt-2 text-primary'>Order History</h4>
    <TradeTable />
  </Layout>
)

export default compose(
  setDisplayName('TradeHistory'),
)(TradeHistory)
