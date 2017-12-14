import React from 'react'
import Layout from 'Components/Layout'
import Keystore from 'Components/Keystore'
import MetaMask from 'Components/MetaMask'
import CreateWallet from 'Components/CreateWallet'
import HardwareWallet from 'Components/HardwareWallet'
import Blockstack from 'Components/Blockstack'
import styles from './style'

const AccessView = (props) => {
  return (
    <Layout {...props.layoutProps}>
      <div className={`row ${styles.startContainer}`}>
        <div className='col-md-3'>
          <MetaMask />
        </div>
        <div className='col-md-3'>
          <HardwareWallet type='ledger' />
        </div>
        <div className='col-md-3'>
          <HardwareWallet type='trezor' />
        </div>
        <div className='col-md-3'>
          <Blockstack />
        </div>
      </div>
      <div className='row justify-content-center margin-top-20'>
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
