import React from 'react'
import { Switch } from 'react-router-dom'
import WalletClosedController from 'Controllers/WalletClosedController'
import WalletOpenedController from 'Controllers/WalletOpenedController'
import AccessController from 'Controllers/AccessController'
import BalancesController from 'Controllers/BalancesController'
import ModifyController from 'Controllers/ModifyController'

const App = () => {
  return (
    <Switch>
      <WalletClosedController exact path='/' component={AccessController} />
      <WalletOpenedController path='/balances' component={BalancesController} />
      <WalletOpenedController path='/modify' component={ModifyController} />
    </Switch>
  )
}

export default App
