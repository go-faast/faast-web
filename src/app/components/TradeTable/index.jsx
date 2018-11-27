import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import CompletedOrdersTable from 'Components/TradeTable/CompletedOrdersTable'
import PendingOrdersTable from 'Components/TradeTable/PendingOrdersTable'


const TradeTable = () => (
  <Fragment>
    <PendingOrdersTable/>
    <CompletedOrdersTable/>
  </Fragment>
)

export default compose(
  setDisplayName('TradeTable'),
)(TradeTable)
