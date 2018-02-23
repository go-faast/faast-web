import React from 'react'
import PropTypes from 'prop-types'
import CreateWalletModal from 'Components/CreateWalletModal'
import styles from './style'
import { accessTile as accessTileStyle } from 'Components/AccessTile/style'

const CreateWalletView = (props) => {
  return (
    <button onClick={props.handleClick} className={`${accessTileStyle} ${styles.tileBorder}`}>
      <div className={styles.addNew} />
      <h5 className='text-gradient pt-3'>create a new wallet</h5>
      <CreateWalletModal {...props.modalProps} />
    </button>
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
