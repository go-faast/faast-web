import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody, ModalHeader, ModalFooter, Form, FormGroup, Input, Label } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Button } from 'reactstrap'

import ReduxFormField from 'Components/ReduxFormField'

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

const CreateWalletModalView = (props) => {
  const renderView = () => {
    switch (props.view) {
      case 'create':
        return (
          <CreatePasswordForm
            onSubmit={props.handleCreatePassword}
            handleCancel={props.handleCloseModal}
            {...props}
          />
        )
      case 'import':
        return (
          <ImportWalletForm
            onSubmit={props.handleImportPrivKey}
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

let CreatePasswordForm = ({
  walletName, handleSubmit, handleCancel,
  invalid, validatePassword, validatePasswordConfirm }) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody className='text-left'>
      <div className='mb-3'>
        Enter a password for your {walletName}. Please make a note of your password. You will not be able to access the funds in your {walletName} without your password.
      </div>
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='create-password'
        name='password'
        type='password'
        label='Password'
        placeholder='Enter a password...'
        autoFocus
        autoComplete='new-password'
        validate={validatePassword}
        labelProps={{ xs: '12', md: '4'}}
        inputCol={{ xs:'12', md: true }}
      />
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='create-password-confirm'
        name='passwordConfirm'
        type='password'
        label='Confirm Password'
        placeholder='Enter the password again...'
        autoFocus
        autoComplete='new-password'
        validate={validatePasswordConfirm}
        labelProps={{ xs: '12', md: '4'}}
        inputCol={{ xs:'12', md: true }}
      />
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' type='submit' onClick={handleSubmit} disabled={invalid}>Continue</Button>
    </ModalFooter>
  </Form>
)

CreatePasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

CreatePasswordForm = reduxForm({
  form: 'createPasswordForm'
})(CreatePasswordForm)

let ImportWalletForm = ({
  invalid, handleSubmit, handleCancel
}) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <h4 className='modal-title'>Import private key</h4>
      <div className='modal-text'>
        Enter the private key of your existing Ethereum wallet.
        <FormGroup>
          <Input
            tag={Field}
            name='privateKey'
            component='textarea'
            placeholder='Enter your private key...'
            autoComplete='off'
          />
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' onClick={handleSubmit} disabled={invalid}>Continue</Button>
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

let DownloadKeystoreForm = ({
  handleSubmit, handleCancel, handleDownload, handleDisclaimerAgreedChange,
  hasDownloadedFile, isNewWallet, walletName, agreedToDisclaimer
}) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <div className='modal-text'>
        <FormGroup>
          <Button color='primary' size='lg' onClick={handleDownload} className='text-medium'>
            <i className='fa fa-download mr-2'/>Download {walletName} file
          </Button>
        </FormGroup>
        <div className='text-left'>
          <h5 className='text-primary'>Please acknowledge the following disclaimer:</h5>
          <ol className='mb-2'>
            {getAcks({ isNewWallet, walletName }).map((ack) => (
              <li key={ack} className='mb-2'>
                {ack}
              </li>
            ))}
          </ol>
          <ReduxFormField
            type='checkbox'
            name='disclaimerAgreed'
            onChange={handleDisclaimerAgreedChange}
            disabled={!hasDownloadedFile}
            label='I understand and agree with all of the above'
          />
        </div>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button outline color='primary' onClick={handleCancel}>Cancel</Button>
      <Button color='success' onClick={handleSubmit} disabled={!(hasDownloadedFile && agreedToDisclaimer)}>Continue</Button>
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
