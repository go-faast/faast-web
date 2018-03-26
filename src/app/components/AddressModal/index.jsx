import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import QRCode from 'qrcode.react'
import styles from './style'

const AddressModal = ({ address, showModal, toggleModal, showDownload, handleDownload }) => (
  <Modal backdrop='static' isOpen={showModal} toggle={toggleModal}>
    <ModalHeader tag='h4' toggle={toggleModal} className='text-primary'>
      Address
    </ModalHeader>
    <ModalBody className='text-center'>
      <div className={styles.qrOuterContainer}>
        <div className={styles.qrInnerContainer}>
          <a href={`ethereum:${address}`}>
            <QRCode size={210} level='L' value={`${address}`} />
          </a>
        </div>
      </div>
      <div className={styles.addressText}>
        {address}
      </div>
      {showDownload &&
        <div onClick={handleDownload} className='cursor-pointer'>
          download keystore file
        </div>
      }
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
