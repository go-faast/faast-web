import React, { Fragment } from 'react'
import { Switch } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import routes from 'Routes'
import { withRouter } from 'react-router'
import ModalRoute from 'Components/ModalRoute'
import HardwareWalletModal from 'Components/HardwareWalletModal'
import Layout from 'Components/Layout'
import Access from 'Components/Access'
import WalletInfoModal from 'Components/WalletInfoModal'

const Connect = ({ location: { state: { forwardurl } = {} } }) => (
  <Fragment>
    <Helmet>
      <title>Connect and Trade from your Cryptocurrency Wallet - Faa.st</title>
      <meta name='description' content='Connect your Trezor, Ledger, MetaMask, or mobile cryptocurrency wallet to the Faa.st exchange and instantly trade over 100+ coins.' /> 
    </Helmet>
    <Layout className='pt-3'>
      <Access forwardurl={forwardurl} />
      <Switch>
        <ModalRoute closePath={routes.connect.path} path={routes.connectHwWallet.path} render={(props) => (
          <HardwareWalletModal walletType={props.match.params.walletType} {...props}/>
        )}/>
        <ModalRoute closePath={routes.connect.path} path={routes.walletInfoModal.path} render={(props) => (
          <WalletInfoModal walletType={props.match.params.walletType} {...props}/>
        )}/>
      </Switch>
    </Layout>
  </Fragment>
)

export default withRouter(Connect)