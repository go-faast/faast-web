import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Connect from 'Components/Connect'
import WalletClosed from 'Components/WalletClosed'
import WalletOpened from 'Components/WalletOpened'
import Dashboard from 'Components/Dashboard'
import Modify from 'Components/Modify'
import SearchResults from 'Components/SearchResults'

const AppView = () => {
  return (
    <Switch>
      <WalletClosed exact path='/'/>
      <WalletOpened path='/dashboard' component={Dashboard}/>
      <WalletOpened path='/swap' component={Modify}/>
      <Route path='/connect' component={Connect}/>
      <Route path='/address/:addressQuery' component={SearchResults}/>

      {/* Legacy routes */}
      <Redirect exact from='/balances' to='/dashboard'/>
      <Redirect exact from='/modify' to='/swap'/>
    </Switch>
  )
}

export default AppView
