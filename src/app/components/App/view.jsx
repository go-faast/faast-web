import React from 'react'
import { Switch, Route } from 'react-router-dom'
import WalletClosed from 'Components/WalletClosed'
import Access from 'Components/Access'
import Balances from 'Components/Balances'
import Modify from 'Components/Modify'
import View from 'Components/View'

const AppView = () => {
  return (
    <Switch>
      <WalletClosed exact path='/' />
      <Route path='/connect' component={Access} />
      <Route path='/balances' component={Balances} />
      <Route path='/modify' component={Modify} />
      <Route path='/address/:address' component={View} />
    </Switch>
  )
}

export default AppView
