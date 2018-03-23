import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody, ModalHeader, ModalFooter, Form, FormGroup, Input, Label } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Button } from 'reactstrap'

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
          <DownloadKeystoreForm
            onSubmit={props.handleContinue}
            handleCancel={props.handleCloseModal}
            {...props}
          />
        )
    }
  }
  return (
    <Modal backdrop='static' isOpen={props.showModal} className='text-center' toggle={props.handleCancel}>
      <ModalHeader tag='h3' className='text-primary' cssModule={{ 'modal-title': 'modal-title mx-auto' }} toggle={props.handleCancel}>
        {(props.isNewWallet &&
          <span>Create wallet</span>) ||
          <span>Download keystore file</span>
        }
      </ModalHeader>
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

let CreatePasswordForm = ({ handleSubmit, handleCancel, walletName }) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <div className='modal-text'>
        <FormGroup>
          Enter a password for your {walletName}. Please make a note of your password. You will not be able to access the funds in your {walletName} without your password.
        </FormGroup>
        <FormGroup>
          <Input
            tag={Field}
            name='password'
            component='input'
            type='password'
            placeholder='Enter a password'
            className='text-center'
          />
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' type='submit' onClick={handleSubmit}>Continue</Button>
    </ModalFooter>
  </Form>
)

CreatePasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleImportPrivKey: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

CreatePasswordForm = reduxForm({
  form: 'createPasswordForm'
})(CreatePasswordForm)

let ConfirmPasswordForm = ({ handleSubmit, handleCancel }) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <div className='modal-text'>
        <FormGroup>
          Please confirm your password
        </FormGroup>
        <FormGroup>
          <Input
            tag={Field}
            name='password'
            component='input'
            type='password'
            placeholder='Enter password again'
            className='text-center'
          />
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' type='submit' onClick={handleSubmit}>Confirm</Button>
    </ModalFooter>
  </Form>
)

ConfirmPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

ConfirmPasswordForm = reduxForm({
  form: 'confirmPasswordForm'
})(ConfirmPasswordForm)

let ImportWalletForm = (props) => (
  <Form onSubmit={props.handleSubmit}>
    <ModalBody>
      <h4 className='modal-title'>Import your exisiting wallet</h4>
      <div className='modal-text'>
        Enter the private key of your exisiting wallet and a new password that will be used to encrypt the wallet.
        <FormGroup>
          <Input
            tag={Field}
            name='privateKey'
            component='textarea'
            placeholder='Private Key'
          />
        </FormGroup>
        <FormGroup>
          <Input
            tag={Field}
            name='password'
            component='input'
            type='password'
            placeholder='enter a password'
          />
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={props.handleCancel}>Cancel</Button>
      <Button color='success' onClick={props.handleSubmit}>Continue</Button>
    </ModalFooter>
  </Form>
)

ImportWalletForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

ImportWalletForm = reduxForm({
  form: 'importWalletFor'
})(ImportWalletForm)

const getAcks = ({ isNewWallet, walletName }) => [
  `The ${walletName} file can used to send any funds it contains.`,
  `The ${walletName} file contains a sensitive private key that is encrypted and can only be accessed using the password I entered.`,
  ...(isNewWallet ? [
    `Faast does not have a backup of the file or password. This ${walletName} was generated in my web browser and was never sent over the internet.`,
    'If I lose access to the file or forget the password I forfeit all funds it contains.',
    'I have downloaded and stored this file in a secure location on my computer.',
  ] : [
    `The ${walletName} file, in combination with my password, can be used to send funds using applications other than Faast.`,
  ])
]

let DownloadKeystoreForm = ({ handleSubmit, handleCancel, handleDownload, downloaded, isNewWallet, walletName }) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <div className='modal-text'>
        <FormGroup>
          <Button color='faast' size='lg' onClick={handleDownload} className='text-medium'>
            <i className='fa fa-download mr-2'/>Download {walletName} file
          </Button>
        </FormGroup>
        <FormGroup tag="fieldset" className='text-left'>
          <legend className='h5 text-primary'>Please acknowledge that you understand the following:</legend>
          {getAcks({ isNewWallet, walletName }).map((ack, i) => (
            <FormGroup key={ack} check className='mb-2'>
              <Label check>
                <Input type="checkbox" name={`ack${i}`} />{' '}{ack}
              </Label>
            </FormGroup>
          ))}
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' onClick={handleSubmit} disabled={!downloaded}>Confirm</Button>
    </ModalFooter>
  </Form>
)

DownloadKeystoreForm.propTypes = {
  handleDownload: PropTypes.func.isRequired,
  handleContinue: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

DownloadKeystoreForm = reduxForm({
  form: 'downloadKeystore'
})(DownloadKeystoreForm)

export default CreateWalletModalView
