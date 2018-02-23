import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Button } from 'reactstrap'
import { addKeys } from 'Utilities/reactFuncs'

const CreateWalletModalView = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'create':
        return (
          <CreatePasswordForm
            onSubmit={props.handleCreatePassword}
            handleCancel={props.handleCloseModal}
            handleImportPrivKey={props.handleImportPrivKey}
            {...props}
          />
        )
      case 'import':
        return (
          <ImportWalletForm
            onSubmit={props.handleCreatePasswordWithPrivKey}
            handleCancel={props.handleCloseModal}
            {...props}
          />
        )
      case 'confirm':
        return (
          <ConfirmPasswordForm
            onSubmit={props.handleConfirmPassword}
            handleCancel={props.handleCloseModal}
            {...props}
          />
        )
      case 'download':
        return (
          <DownloadKeystore
            handleCancel={props.handleCloseModal}
            {...props}
          />
        )
    }
  }
  return (
    <Modal size='lg' backdrop='static' isOpen={props.showModal} className='text-center'>
      {/* <ModalHeader toggle={props.handleCloseModal}></ModalHeader> */}
      {renderView()}
    </Modal>
  )
}
CreateWalletModalView.propTypes = {
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

let CreatePasswordForm = (props) => {
  const name = props.isNewWallet ? 'wallet' : 'keystore file'
  return (
    <form onSubmit={props.handleSubmit}>
      <ModalBody>
        <div className='modal-title'>
          {(props.isNewWallet &&
            <span>Create a new wallet</span>) ||
            <span>download keystore file</span>
          }
        </div>
        <div className='modal-text'>
          Enter a password for your {name}. Please make a note of your password. You will not be able to access the funds in your {name} without your password.
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
          <Button color='faast' onClick={props.handleSubmit}>create new</Button>
        </div>
        {props.isNewWallet &&
          <div className='form-group'>
            <Button color='faast' outline onClick={props.handleImportPrivKey}>import private key</Button>
          </div>
        }
        <div className='form-group'>
          <Button color='link' onClick={props.handleCancel}>cancel</Button>
        </div>
      </ModalBody>
    </form>
  )
}

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
      <div className='modal-title'>
        {(props.isNewWallet &&
          <span>Create a new wallet</span>) ||
          <span>download keystore file</span>
        }
      </div>
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
        <Button color='faast' onClick={props.handleSubmit}>continue</Button>
      </div>
      <div className='form-group'>
        <Button color='link' onClick={props.handleCancel} className='m-2'>cancel</Button>
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
        <Button color='faast' onClick={props.handleSubmit}>continue</Button>
      </div>
      <div className='form-group'>
        <Button color='link' onClick={props.handleCancel} className='m-2'>cancel</Button>
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
      <div className='modal-title'>
        {(props.isNewWallet &&
          <span>Create a new wallet</span>) ||
          <span>download keystore file</span>
        }
      </div>
      <div className='mt-3 text-center'>
        <Button color='faast' size='lg' onClick={props.handleDownload} className='text-medium'>
          <i className='fa fa-download'/>&nbsp;
          {(props.isNewWallet &&
            <span>Download keystore file</span>) ||
            <span>download</span>
          }
        </Button>
      </div>
      <div className='modal-text'>
        <ul>
          <li>Your wallet's private key allows you to send funds</li>
          <li>The keystore file contains your private key and is encrypted with the password you entered</li>
          {(props.isNewWallet && addKeys([
            <li>If you lose access to the file or your password, then you will lose access to your funds</li>,
            <li>It is highly recommended to backup this file. This procedure was all done on your computer, we do not hold your file or password</li>
          ])) ||
            <li>The keystore file, as well as your password, can be used to send assets from other wallets</li>
          }
        </ul>
      </div>
      <div className='form-group'>
        <Button color='faast' onClick={props.handleContinue} disabled={!props.downloaded}>continue</Button>
      </div>
      <div className='form-group'>
        <Button color='link' onClick={props.handleCancel}>cancel</Button>
      </div>
    </ModalBody>
  </div>
)

DownloadKeystore.propTypes = {
  handleDownload: PropTypes.func.isRequired,
  handleContinue: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

export default CreateWalletModalView
