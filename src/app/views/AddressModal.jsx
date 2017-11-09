import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import QRCode from 'qrcode.react'
import styles from 'Styles/AddressModal.scss'

const AddressModal = (props) => (
  <Modal backdrop='static' isOpen={props.showModal} toggle={props.toggleModal}>
    <ModalBody className='text-center'>
      <button onClick={props.toggleModal} type='button' className={styles.closeButton} aria-label='Close'>
        <i className={`fa fa-close ${styles.closeIcon}`} />
      </button>
      <div className='modal-title'>address</div>
      <div className='modal-text'>
        <a href={`ethereum:${props.address}`}>
          <QRCode size={210} level='H' value={`ethereum:${props.address}`} />
        </a>
        <div className={styles.addressText}>
          {props.address}
        </div>
      </div>
    </ModalBody>
  </Modal>
)

AddressModal.propTypes = {
  showModal: PropTypes.bool,
  toggleModal: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired
}

export default AddressModal
