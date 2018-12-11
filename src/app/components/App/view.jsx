import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import RedirectPrefix from 'Components/RedirectPrefix'
import Connect from 'Components/Connect'
import TradeHistory from 'Components/TradeHistory'
import WalletOpened from 'Components/WalletOpened'
import Dashboard from 'Components/Dashboard'
import Modify from 'Components/Modify'
import SearchResults from 'Components/SearchResults'
import ModalRoute from 'Components/ModalRoute'
import TradeDetailModal from 'Components/TradeDetailModal'
import SwapWidget from 'Components/SwapWidget'
import AssetDetail from 'Components/AssetDetail'
import AssetIndex from 'Components/AssetIndex'
import AssetWatchlist from 'Components/AssetWatchlist'
import AssetTrending from 'Components/AssetTrending'

import {
  root, dashboard, rebalance, connect, viewOnlyAddress,
  tradeHistory, tradeDetail, swapWidget, assetDetail, assetIndex,
  watchlist, trending
} from 'Routes'

const AppView = ({ hasNoWallets }) => (
  <Fragment>
    <Switch>
      <Route exact path={root.path} render={() => (
        hasNoWallets
          ? (<Redirect to='/connect' />)
          : (<Redirect to='/dashboard' />)
      )} />

      {/* Routes requiring a connected wallet */}
      <WalletOpened exact path={dashboard.path} component={Dashboard}/>
      <WalletOpened path={rebalance.path} component={Modify}/>

      {/* Routes that don't require a connected wallet */}
      <Route path={connect.path} component={Connect}/>
      <Route path={viewOnlyAddress.path} component={SearchResults}/>
      <Route path={swapWidget.path} component={SwapWidget}/>
      <Route path={tradeHistory.path} component={TradeHistory}/>
      <Route path={watchlist.path} component={AssetWatchlist}/>
      <Route path={trending.path} component={AssetTrending}/>
      <Route path={assetDetail.path} component={AssetDetail}/>
      <Route path={assetIndex.path} component={AssetIndex}/>
      

      {/* Legacy routes */}
      <Redirect exact from='/balances' to={dashboard.path}/>
      <Redirect exact from='/modify' to={rebalance.path}/>
      <Redirect exact from='/dashboard' to={dashboard.path}/>
      <Redirect exact from='/orders' to={tradeHistory.path}/>
      <RedirectPrefix from='/rebalance' to={rebalance.path}/>
      <RedirectPrefix from='/connect' to={connect.path}/>

      {/* Fallback for unknown routes */}
      <Redirect to={dashboard.path}/>
    </Switch>

    {/* Routes that show a modal over one of the above pages */}
    <ModalRoute closePath={tradeHistory.path} path={tradeDetail.path} render={(props) => (
      <TradeDetailModal tradeId={props.match.params.tradeId} {...props}/>
    )}/>
  </Fragment>
)

export default AppView
