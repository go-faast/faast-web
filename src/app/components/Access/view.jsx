import React from 'react'
import Layout from 'Components/Layout'
import Keystore from 'Components/Keystore'
import Web3Wallet from 'Components/Web3Wallet'
import CreateWallet from 'Components/CreateWallet'
import HardwareWallet from 'Components/HardwareWallet'
import Blockstack from 'Components/Blockstack'
import styles from './style'

const AccessView = (props) => {
  return (
    <Layout {...props.layoutProps}>
      <h3 className={styles.title}>Select your wallet</h3>
      <h4 className={styles.walletRowHeading}>Hardware Wallets</h4>
      <h6 className={styles.walletRowSubheading}>Recommended</h6>
      <div className={`row justify-content-center ${styles.startContainer}`}>
        <div className='col-md-3'>
          <HardwareWallet type='trezor' />
        </div>
        <div className='col-md-3'>
          <HardwareWallet type='ledger' />
        </div>
      </div>
      <h4 className={styles.walletRowHeading}>Software Wallets</h4>
      <div className='row justify-content-center'>
        <div className='col-md-3'>
          <Web3Wallet type='metamask' />
        </div>
        <div className='col-md-3'>
          <Web3Wallet type='mist' />
        </div>
        <div className='col-md-3'>
          <Web3Wallet type='parity' />
        </div>
        <div className='col-md-3'>
          <Blockstack />
        </div>
      </div>
      <h4 className={styles.walletRowHeading}>Manual</h4>
      <div className='row justify-content-center'>
        <div className='col-md-3'>
          <div id='keystore-container' className={styles.tileContainer}>
            <Keystore />
          </div>
        </div>
        <div className='col-md-3'>
          <CreateWallet />
        </div>
      </div>
      <div className={`row ${styles.bottomContainer}`}>
        <div className='col'>
          <div className={styles.openSourceContainer}>
            <a className={styles.openSourceLink} href='https://github.com/go-faast/faast-portfolio' target='_blank' rel='noopener'>
              <div className={styles.openSource}>
                <i className='fa fa-github fa-2x' />
                <span className={styles.openSourceText}>open source and secure</span>
                <i className='fa fa-lock fa-2x' />
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AccessView
