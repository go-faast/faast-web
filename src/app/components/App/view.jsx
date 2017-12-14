import React from 'react'
import { Switch, Route } from 'react-router-dom'
import WalletClosed from 'Components/WalletClosed'
import WalletOpened from 'Components/WalletOpened'
import Access from 'Components/Access'
import Balances from 'Components/Balances'
import Modify from 'Components/Modify'
import View from 'Components/View'

const AppView = () => {
  return (
    <Switch>
      <WalletClosed exact path='/' component={Access} />
      <WalletOpened path='/balances' component={Balances} />
      <WalletOpened path='/modify' component={Modify} />
      <Route path='/address/:address' component={View} />
    </Switch>
  )
}

export default AppView
