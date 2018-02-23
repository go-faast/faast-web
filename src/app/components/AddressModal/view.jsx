import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import QRCode from 'qrcode.react'
import styles from './style'

const AddressModalView = (props) => (
  <Modal backdrop='static' isOpen={props.showModal} toggle={props.toggleModal}>
    <ModalBody className='text-center'>
      <button onClick={props.toggleModal} type='button' className={styles.closeButton} aria-label='Close'>
        <i className={`fa fa-close ${styles.closeIcon}`} />
      </button>
      <div className='modal-title'>address</div>
      <div className='modal-text'>
        <div className={styles.qrOuterContainer}>
          <div className={styles.qrInnerContainer}>
            <a href={`ethereum:${props.address}`}>
              <QRCode size={210} level='L' value={`${props.address}`} />
            </a>
          </div>
        </div>
        <div className={styles.addressText}>
          {props.address}
        </div>
        {props.showDownloadKeystore &&
          <div onClick={props.handleDownloadKeystore} className='cursor-pointer'>
            download keystore file
          </div>
        }
      </div>
    </ModalBody>
  </Modal>
)

AddressModalView.propTypes = {
  showModal: PropTypes.bool,
  toggleModal: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired
}

export default AddressModalView
