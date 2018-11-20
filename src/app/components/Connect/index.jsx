import React from 'react'
import { Switch } from 'react-router-dom'
import routes from 'Routes'
import ModalRoute from 'Components/ModalRoute'
import HardwareWalletModal from 'Components/HardwareWalletModal'
import Layout from 'Components/Layout'
import Access from 'Components/Access'
import WalletInfoModal from 'Components/WalletInfoModal'

const Connect = () => (
  <Layout className='pt-3'>
    <Access/>
    <Switch>
      <ModalRoute closePath={routes.connect.path} path={routes.connectHwWallet.path} render={(props) => (
        <HardwareWalletModal walletType={props.match.params.walletType} {...props}/>
      )}/>
      <ModalRoute closePath={routes.connect.path} path={routes.walletInfoModal.path} render={(props) => (
        <WalletInfoModal walletType={props.match.params.walletType} {...props}/>
      )}/>
    </Switch>
  </Layout>
)

export default Connect
