import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap'
import QRCode from 'qrcode.react'

import AddressLink from 'Components/AddressLink'

const AddressModal = ({ address, showModal, toggleModal }) => (
  <Modal isOpen={showModal} toggle={toggleModal}>
    <ModalHeader tag='h4' toggle={toggleModal} className='text-primary'>
      Address
    </ModalHeader>
    <ModalBody className='text-center d-flex flex-column align-items-center'>
      <div className='word-break-all'>{address}</div>
      <a href={`ethereum:${address}`} className='my-3'>
        <div className='p-4 bg-white d-inline-block'>
          <QRCode size={210} level='L' value={address} />
        </div>
      </a>
      <Button tag={AddressLink} outline color='primary' size='sm' address={address}>View on Explorer</Button>
      <Button color='link' onClick={toggleModal} className='mt-4'>close</Button>
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
