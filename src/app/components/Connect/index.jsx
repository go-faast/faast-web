import React from 'react'

import ModalRoute from 'Components/ModalRoute'
import HardwareWalletModal from 'Components/HardwareWalletModal'
import Layout from 'Components/Layout'
import Access from 'Components/Access'

const Connect = ({ match }) => (
  <Layout className='pt-3'>
    <Access/>
    <ModalRoute basePath={match.path} path='/hw/:walletType' render={(props) => (
      <HardwareWalletModal walletType={props.match.params.walletType} {...props}/>
    )}/>
  </Layout>
)

export default Connect
