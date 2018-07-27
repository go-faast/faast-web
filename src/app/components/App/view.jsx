import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Connect from 'Components/Connect'
import WalletClosed from 'Components/WalletClosed'
import WalletOpened from 'Components/WalletOpened'
import Dashboard from 'Components/Dashboard'
import Modify from 'Components/Modify'
import SearchResults from 'Components/SearchResults'
import { root, dashboard, swap, connect, viewOnlyAddress } from 'Routes'

const AppView = () => (
  <Switch>
    <WalletClosed exact path={root.path}/>
    <WalletOpened path={dashboard.path} component={Dashboard}/>
    <WalletOpened path={swap.path} component={Modify}/>
    <Route path={connect.path} component={Connect}/>
    <Route path={viewOnlyAddress.path} component={SearchResults}/>

    {/* Legacy routes */}
    <Redirect exact from='/balances' to={dashboard.path}/>
    <Redirect exact from='/modify' to={swap.path}/>
  </Switch>
)

export default AppView
