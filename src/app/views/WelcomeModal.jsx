import React from 'react'
import { Modal, ModalBody } from 'reactstrap'

const WelcomeModal = (props) => (
  <Modal size='lg' backdrop='static' isOpen={props.showModal}>
    <ModalBody className='text-center'>
      <div className='modal-title padding-bottom-20'>welcome</div>
      <div className='padding-bottom-20 text-medium-grey'>
        An ethereum wallet has been generated for you. It is unique to your Blockstack ID and this domain ({window.location.origin}). You may send ether to this address to start swapping for other assets.
      </div>
      <div className='padding-bottom-20'>
        {props.address}
      </div>
      <div className='padding-bottom-20 text-medium-grey'>
        Before proceeding, you will need to backup your wallet to a keystore file. The file will be encrypted with a password for your security. With this file you can restore the wallet on faa.st and other apps that support the format.
      </div>
      <div className='form-group'>
        <div className='button-primary cursor-pointer' onClick={props.handleBackup}>backup wallet</div>
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleClose}>close wallet</div>
      </div>
    </ModalBody>
  </Modal>
)

export default WelcomeModal
