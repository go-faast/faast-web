import React from 'react'
import styles from 'Styles/MetaMask.scss'

const MetaMask = (props) => {
  return (
    <div onClick={props.handleClick} className={styles.tileContainer}>
      <div className={`text-uppercase ${styles.importHeader}`}>Access With</div>
      <div className={styles.walletDesc}>
        MetaMask
      </div>
    </div>
  )
}

export default MetaMask
