import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody, ModalHeader, ModalFooter, Form, FormGroup, Input } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Button } from 'reactstrap'

import ReduxFormField from 'Components/ReduxFormField'
import HiddenUsernameField from 'Components/HiddenUsernameField'
import T from 'Components/i18n/T'

const getAcks = ({ isNewWallet, walletName }) => [
  <T tag='span' i18nKey='app.createWalletModal.ack1' key='1'>The {walletName} file can used to send any funds it contains.</T>,
  <T tag='span' i18nKey='app.createWalletModal.ack2' key='2'>The {walletName} file contains a sensitive private key that is encrypted and can only be accessed using the password I entered.</T>,
  ...(isNewWallet ? [
    <T tag='span' i18nKey='app.createWalletModal.ack3' key='3'>Faast does not have a backup of the file or password. This {walletName} was generated in my web browser and was never sent over the internet.</T>,
    <T tag='span' i18nKey='app.createWalletModal.ack4' key='4'>If I lose access to the file or forget the password I forfeit all funds it contains.</T>,
    <T tag='span' i18nKey='app.createWalletModal.ack5' key='5'>I have downloaded and stored this file in a secure location on my computer.</T>,
  ] : [
    <T tag='span' i18nKey='app.createWalletModal.ack6' key='6'>The {walletName} file, in combination with my password, can be used to send funds using applications other than Faast.</T>,
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
          <T tag='span' i18nKey='app.createWalletModal.createWallet'>Create wallet</T>) ||
          <T tag='span' i18nKey='app.createWalletModal.downloadKeystore'>Download keystore file</T>
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
  walletName, walletAddress, handleSubmit, handleCancel, submitting,
  invalid, validatePassword, validatePasswordConfirm, t
}) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody className='text-left'>
      <div className='mb-3'>
        <T tag='span' i18nKey='app.createWalletModal.enterPassword'>
          Enter a password for your {{ walletName }}. Please make a note of your password. You will not be able to access the funds in your {{ walletName }} without your password.
        </T>
      </div>

      <HiddenUsernameField value={walletAddress || ''}/>

      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='create-password'
        name='password'
        type='password'
        label={<T tag='span' i18nKey='app.createWalletModal.passwordLabel'>Password</T>}
        placeholder={t('app.createWalletModal.enterPasswordPlaceholder', 'Enter a password...')}
        autoFocus
        autoComplete='new-password'
        validate={validatePassword}
        labelProps={{ xs: '12', md: '4' }}
        inputCol={{ xs:'12', md: true }}
      />
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='create-password-confirm'
        name='passwordConfirm'
        type='password'
        label={<T tag='span' i18nKey='app.createWalletModal.confirmPasswordLabel'>Confirm Password</T>}
        placeholder={t('app.createWalletModal.confirmPasswordPlaceholder', 'Enter the password again...')}
        autoComplete='new-password'
        validate={validatePasswordConfirm}
        labelProps={{ xs: '12', md: '4' }}
        inputCol={{ xs:'12', md: true }}
      />
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>
        <T tag='span' i18nKey='app.createWalletModal.cancel'>Cancel</T>
      </Button>
      <Button type='submit' color='success' disabled={submitting || invalid}>
        <T tag='span' i18nKey='app.createWalletModal.continue'>Continue</T>
      </Button>
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
  invalid, handleSubmit, handleCancel, t
}) => (
  <Form onSubmit={handleSubmit}>
    <ModalBody>
      <T tag='h4' i18nKey='app.createWalletModal.importPrivateKey' className='modal-title'>Import private key</T>
      <div className='modal-text'>
        <T tag='span' i18nKey='app.createWalletModal.enterPrivateKey'>Enter the private key of your existing Ethereum wallet.</T>
        <FormGroup>
          <Input
            tag={Field}
            name='privateKey'
            component='textarea'
            placeholder={t('app.createWalletModal.enterPrivateKeyPlaceholder', 'Enter your private key...')}
            autoComplete='off'
          />
        </FormGroup>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>
        <T tag='span' i18nKey='app.createWalletModal.cancel'>Cancel</T>
      </Button>
      <Button type='submit' color='success' disabled={invalid}>
        <T tag='span' i18nKey='app.createWalletModal.continue'>Continue</T>
      </Button>
    </ModalFooter>
  </Form>
)

ImportWalletForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

ImportWalletForm = reduxForm({
  form: 'importWalletForm'
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
            <T tag='span' i18nKey='app.createWalletModal.download'><i className='fa fa-download mr-2'/>Download {walletName} file</T>
          </Button>
        </FormGroup>
        <div className='text-left'>
          <T tag='h5' i18nKey='app.createWalletModal.pleaseAck' className='text-primary'>Please acknowledge the following disclaimer:</T>
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
            label={<T tag='span' i18nKey='app.createWalletModal.agree'>I understand and agree with all of the above</T>}
          />
        </div>
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      <Button type='button' color='primary' outline onClick={handleCancel}>
        <T tag='span' i18nKey='app.createWalletModal.cancel'>Cancel</T>
      </Button>
      <Button type='submit' color='success' disabled={!(hasDownloadedFile && agreedToDisclaimer)}>
        <T tag='span' i18nKey='app.createWalletModal.continue'>Continue</T>
      </Button>
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
