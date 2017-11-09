import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import styles from 'Styles/CreateWalletModal.scss'

const CreateWalletModal = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'create':
        return (
          <CreatePasswordForm
            onSubmit={props.handleCreatePassword}
            handleCancel={props.handleCloseModal}
            handleImportPrivKey={props.handleImportPrivKey}
          />
        )
      case 'import':
        return (
          <ImportWalletForm
            onSubmit={props.handleCreatePasswordWithPrivKey}
            handleCancel={props.handleCloseModal}
          />
        )
      case 'confirm':
        return (
          <ConfirmPasswordForm
            onSubmit={props.handleConfirmPassword}
            handleCancel={props.handleCloseModal}
          />
        )
      case 'download':
        return (
          <DownloadKeystore
            handleDownload={props.handleDownload}
            handleContinue={props.handleContinue}
            handleCancel={props.handleCloseModal}
          />
        )
    }
  }
  return (
    <Modal className={styles.container} backdrop='static' isOpen={props.showModal}>
      {/* <ModalHeader toggle={props.handleCloseModal}></ModalHeader> */}
      {renderView()}
    </Modal>
  )
}
CreateWalletModal.propTypes = {
  view: PropTypes.string.isRequired,
  showModal: PropTypes.bool,
  handleCreatePassword: PropTypes.func,
  handleCloseModal: PropTypes.func,
  handleImportPrivKey: PropTypes.func,
  handleCreatePasswordWithPrivKey: PropTypes.func,
  handleConfirmPassword: PropTypes.func,
  handleDownload: PropTypes.func,
  handleContinue: PropTypes.func
}

let CreatePasswordForm = (props) => (
  <form onSubmit={props.handleSubmit}>
    <ModalBody>
      <div className='modal-title'>Create a new wallet</div>
      <div className='modal-text'>
        Enter a password for your wallet. Please make a note of your password. You will not be able to access the funds in your wallet without your password.
      </div>
      <div className='form-group'>
        <Field
          name='password'
          component='input'
          type='password'
          placeholder='enter a password'
        />
      </div>
      <div className='form-group'>
        <div className='button-primary cursor-pointer' onClick={props.handleSubmit}>Create</div>
      </div>
      <div className='form-group'>
        <div className={styles.importPrivKey} onClick={props.handleImportPrivKey}>import private key</div>
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleCancel}>cancel</div>
      </div>
    </ModalBody>
  </form>
)

CreatePasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleImportPrivKey: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

CreatePasswordForm = reduxForm({
  form: 'createPasswordForm'
})(CreatePasswordForm)

let ConfirmPasswordForm = (props) => (
  <form onSubmit={props.handleSubmit}>
    <ModalBody>
      <div className='modal-title'>Create a new wallet</div>
      <div className='modal-text'>
        Please confirm your password
      </div>
      <div className='form-group'>
        <Field
          name='password'
          component='input'
          type='password'
          placeholder='enter your password'
        />
      </div>
      <div className='form-group'>
        <div className='button-primary cursor-pointer' onClick={props.handleSubmit}>Confirm</div>
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleCancel}>cancel</div>
      </div>
    </ModalBody>
  </form>
)

ConfirmPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

ConfirmPasswordForm = reduxForm({
  form: 'confirmPasswordForm'
})(ConfirmPasswordForm)

let ImportWalletForm = (props) => (
  <form onSubmit={props.handleSubmit}>
    <ModalBody>
      <div className='modal-title'>Import your exisiting wallet</div>
      <div className='modal-text'>
        Enter the private key of your exisiting wallet and a new password that will be used to encrypt the wallet.
      </div>
      <div className='form-group'>
        <Field
          name='privateKey'
          component='textarea'
          placeholder='Private Key'
        />
      </div>
      <div className='form-group'>
        <Field
          name='password'
          component='input'
          type='password'
          placeholder='enter a password'
        />
      </div>
      <div className='form-group'>
        <div className='button-primary cursor-pointer' onClick={props.handleSubmit}>Import</div>
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleCancel}>cancel</div>
      </div>
    </ModalBody>
  </form>
)

ImportWalletForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

ImportWalletForm = reduxForm({
  form: 'importWalletFor'
})(ImportWalletForm)

const DownloadKeystore = (props) => (
  <div>
    <ModalBody>
      <div className='modal-title'>Create a new wallet</div>
      <div onClick={props.handleDownload} className={`download-keystore ${styles.downloadContainer}`}>
        <div className='download-keystore-icon' />
        <div className='download-text'>
          <span className={styles.download}>
            Download keystore file
          </span>
        </div>
      </div>
      <div className='modal-text'>
        <ul>
          <li>Your wallet's private key allows you to send funds</li>
          <li>The keystore file contains your private key and is encrypted with the password you entered</li>
          <li>If you lose access to the file or your password, then you will lose access to your funds</li>
          <li>It is highly recommended to backup this file. This procedure was all done on your computer, we do not hold your file or password</li>
        </ul>
      </div>
      <div className='form-group'>
        <div className='button-primary cursor-pointer' onClick={props.handleContinue}>Continue</div>
      </div>
      <div className='form-group'>
        <div className='cancel cursor-pointer' onClick={props.handleCancel}>cancel</div>
      </div>
    </ModalBody>
  </div>
)

DownloadKeystore.propTypes = {
  handleDownload: PropTypes.func.isRequired,
  handleContinue: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

export default CreateWalletModal
