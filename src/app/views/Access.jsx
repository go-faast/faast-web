import React from 'react'
import LayoutController from 'Controllers/LayoutController'
import KeystoreController from 'Controllers/KeystoreController'
import CreateWalletController from 'Controllers/CreateWalletController'
import HardwareWalletController from 'Controllers/HardwareWalletController'
import styles from 'Styles/Access.scss'

const Access = (props) => {
  return (
    <LayoutController>
      <div className={`row ${styles.startContainer}`}>
        <div className='col-md-3'>
          <div id='keystore-container' className={styles.tileContainer}>
            <KeystoreController />
          </div>
        </div>
        <div className='col-md-3'>
          <HardwareWalletController type='ledger' />
        </div>
        <div className='col-md-3'>
          <HardwareWalletController type='trezor' />
        </div>
        <div className='col-md-3'>
          <CreateWalletController />
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
    </LayoutController>
  )
}

export default Access
