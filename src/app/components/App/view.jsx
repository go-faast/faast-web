import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Connect from 'Components/Connect'
import TradeHistory from 'Components/TradeHistory'
import WalletClosed from 'Components/WalletClosed'
import WalletOpened from 'Components/WalletOpened'
import Dashboard from 'Components/Dashboard'
import Modify from 'Components/Modify'
import SearchResults from 'Components/SearchResults'
import ModalRoute from 'Components/ModalRoute'
import TradeDetailModal from 'Components/TradeDetailModal'
import routes from 'Routes'
import { root, dashboard, swap, connect, viewOnlyAddress, tradeHistory, tradeDetail } from 'Routes'

const AppView = () => (
  <Fragment>
    <Switch>
      <WalletClosed exact path={root.path}/>
      <WalletOpened path={dashboard.path} component={Dashboard}/>
      <WalletOpened path={swap.path} component={Modify}/>
      <Route path={connect.path} component={Connect}/>
      <Route path={viewOnlyAddress.path} component={SearchResults}/>
      <Route path={tradeHistory.path} component={TradeHistory}/>
      {/* Legacy routes */}
      <Redirect exact from='/balances' to={dashboard.path}/>
      <Redirect exact from='/modify' to={swap.path}/>
    </Switch>
    <ModalRoute closePath={routes.tradeHistory.path} path={tradeDetail.path} render={(props) => (
      <TradeDetailModal tradeId={props.match.params.tradeId} {...props}/>
    )}/>
  </Fragment>
)

export default AppView
