import React from 'react'

import routes from 'Routes'
import ModalRoute from 'Components/ModalRoute'
import HardwareWalletModal from 'Components/HardwareWalletModal'
import Layout from 'Components/Layout'
import Access from 'Components/Access'

const Connect = () => (
  <Layout className='pt-3'>
    <Access/>
    <ModalRoute closePath={routes.connect.path} path={routes.connectHwWallet.path} render={(props) => (
      <HardwareWalletModal walletType={props.match.params.walletType} {...props}/>
    )}/>
  </Layout>
)

export default Connect
