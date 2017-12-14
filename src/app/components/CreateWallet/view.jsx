import React from 'react'
import PropTypes from 'prop-types'
import CreateWalletModal from 'Components/CreateWalletModal'
import styles from './style'

const CreateWalletView = (props) => {
  return (
    <div onClick={props.handleClick} className={`${styles.tileContainer} ${styles.tileBorder}`}>
      <div className={styles.addNew} />
      <div className={styles.walletDesc}>create a new wallet</div>
      <CreateWalletModal {...props.modalProps} />
    </div>
  )
}

CreateWalletView.propTypes = {
  handleClick: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool,
    toggleModal: PropTypes.func.isRequired
  })
}

export default CreateWalletView
