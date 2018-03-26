import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Connect from 'Components/Connect'
import WalletClosed from 'Components/WalletClosed'
import Balances from 'Components/Balances'
import Modify from 'Components/Modify'
import View from 'Components/View'

const AppView = () => {
  return (
    <Switch>
      <WalletClosed exact path='/' />
      <Route path='/connect' component={Connect} />
      <Route path='/balances' component={Balances} />
      <Route path='/modify' component={Modify} />
      <Route path='/address/:address' component={View} />
    </Switch>
  )
}

export default AppView
