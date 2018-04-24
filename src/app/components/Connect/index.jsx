import React from 'react'

import config from 'Config'

import ModalRoute from 'Components/ModalRoute'
import HardwareWalletModal from 'Components/HardwareWalletModal'
import Layout from 'Components/Layout'
import Access from 'Components/Access'

const Connect = ({ match }) => (
  <Layout className='pt-3'>
    <Access/>
    {Object.keys(config.walletTypes).map((type) => (
      <ModalRoute key={type} basePath={match.path} path={`/${type}`} render={(props) => (
        <HardwareWalletModal type={type} {...props}/>
      )}/>
    ))}
  </Layout>
)

export default Connect
