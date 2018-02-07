import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import QRCode from 'qrcode.react'
import styles from './style'

const AddressModal = ({ address, showModal, toggleModal, showDownload, handleDownload }) => (
  <Modal backdrop='static' isOpen={showModal} toggle={toggleModal}>
    <ModalBody className='text-center'>
      <button onClick={toggleModal} type='button' className={styles.closeButton} aria-label='Close'>
        <i className={`fa fa-close ${styles.closeIcon}`} />
      </button>
      <div className='modal-title'>address</div>
      <div className='modal-text'>
        <a href={`ethereum:${address}`}>
          <QRCode size={210} level='H' value={`ethereum:${address}`} />
        </a>
        <div className={styles.addressText}>
          {address}
        </div>
        {showDownload &&
          <div onClick={handleDownload} className='cursor-pointer'>
            download keystore file
          </div>
        }
      </div>
    </ModalBody>
  </Modal>
)

AddressModal.propTypes = {
  address: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  showDownload: PropTypes.bool,
  handleDownload: PropTypes.func,
}

AddressModal.defaultProps = {
  showDownload: false,
  handleDownload: () => false,
}

export default AddressModal
