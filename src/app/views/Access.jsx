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
    </LayoutController>
  )
}

export default Access
