import React from 'react'
import PropTypes from 'prop-types'
import CreateWalletModalController from 'Controllers/CreateWalletModalController'
import styles from 'Styles/CreateWallet.scss'

const CreateWallet = (props) => {
  return (
    <div onClick={props.handleClick} className={`${styles.tileContainer} ${styles.tileBorder}`}>
      <div className={styles.addNew} />
      <div className={styles.walletDesc}>create a new wallet</div>
      <CreateWalletModalController {...props.modalProps} />
    </div>
  )
}

CreateWallet.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func.isRequired
  })
}

export default CreateWallet
