import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Card } from 'reactstrap'
import { reduxForm } from 'redux-form'

import {
  isPasswordPromptOpen, getPasswordPromptWalletId, getPasswordPromptUsername
} from 'Selectors'
import {
  handlePasswordPromptSubmit, handlePasswordPromptCancel, passwordPromptSubmitValidator
} from 'Actions/walletPasswordPrompt'

import ReduxFormField from 'Components/ReduxFormField'
import HiddenUsernameField from 'Components/HiddenUsernameField'
import WalletLabel from 'Components/WalletLabel'

import T from 'Components/i18n/T'

export default compose(
  setDisplayName('WalletPasswordPrompt'),
  connect(createStructuredSelector({
    isOpen: isPasswordPromptOpen,
    walletId: getPasswordPromptWalletId,
    username: getPasswordPromptUsername,
  }), {
    onSubmit: handlePasswordPromptSubmit,
    handleCancel: handlePasswordPromptCancel,
    validate: passwordPromptSubmitValidator,
  }),
  reduxForm({
    form: 'walletPasswordPrompt',
    initialValues: {
      password: '',
    }
  })
)(({ isOpen, handleSubmit, handleCancel, submitting, invalid, walletId, username }) => (
  <Modal isOpen={isOpen} toggle={handleCancel} backdrop='static'>
    {isOpen && (
      <Form onSubmit={handleSubmit}>
        <ModalHeader className='text-primary' toggle={handleCancel}>
          <T tag='span' i18nKey='app.walletPasswordPrompt.walletPassword'>Wallet Password</T>
        </ModalHeader>
        <ModalBody>
          <div className='mb-3'>
            <T tag='span' i18nKey='app.walletPasswordPrompt.enterYourPassword'>
              In order to continue, please enter your password for the following wallet
            </T>
          </div>

          {walletId && (
            <Card body className='p-2 mb-3 flat'>
              <WalletLabel.Connected id={walletId}/>
            </Card>
          )}

          <HiddenUsernameField value={username}/>

          <ReduxFormField
            name='password'
            type='password'
            placeholder='Enter password...'
            autoFocus
            autoComplete='current-password'
          />
        </ModalBody>
        <ModalFooter className='justify-content-between'>
          <Button type='button' color='primary' outline onClick={handleCancel}>
            <T tag='span' i18nKey='app.walletPasswordPrompt.cancel'>Cancel</T>
          </Button>
          <Button type='submit' color='primary' disabled={submitting || invalid}>
            <T tag='span' i18nKey='app.walletPasswordPrompt.continue'>Continue</T>
          </Button>
        </ModalFooter>
      </Form>
    )}
  </Modal>
))
