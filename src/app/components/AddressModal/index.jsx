import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import QRCode from 'qrcode.react'
import style from './style'

const AddressModal = ({ address, showModal, toggleModal, showDownload, handleDownload }) => (
  <Modal backdrop='static' isOpen={showModal} toggle={toggleModal}>
    <ModalHeader tag='h4' toggle={toggleModal} className='text-primary'>
      Address
    </ModalHeader>
    <ModalBody className='text-center'>
      <div className={style.qrOuterContainer}>
        <div className={style.qrInnerContainer}>
          <a href={`ethereum:${address}`}>
            <QRCode size={210} level='L' value={`${address}`} />
          </a>
        </div>
      </div>
      <div className={style.addressText}>
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
