import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Card } from 'reactstrap'
import { reduxForm } from 'redux-form'

import {
  isPasswordPromptOpen, getPasswordPromptWalletId
} from 'Selectors'
import {
  handlePasswordPromptSubmit, handlePasswordPromptCancel, passwordPromptSubmitValidator
} from 'Actions/walletPasswordPrompt'

import ReduxFormField from 'Components/ReduxFormField'
import HiddenUsernameField from 'Components/HiddenUsernameField'
import WalletLabel from 'Components/WalletLabel'

export default compose(
  setDisplayName('WalletPasswordPrompt'),
  connect(createStructuredSelector({
    isOpen: isPasswordPromptOpen,
    walletId: getPasswordPromptWalletId,
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
)(({ isOpen, handleSubmit, handleCancel, submitting, invalid, walletId }) => (
  <Modal isOpen={isOpen} toggle={handleCancel} backdrop='static'>
    {isOpen && (
      <Form onSubmit={handleSubmit}>
        <ModalHeader className='text-primary' toggle={handleCancel}>
          Wallet Password
        </ModalHeader>
        <ModalBody>
          <div className='mb-3'>
            In order to continue, please enter your password for the following wallet
          </div>

          {walletId && (
            <Card body className='p-2 mb-3 flat'>
              <WalletLabel.Connected id={walletId}/>
            </Card>
          )}

          <HiddenUsernameField value={walletId}/>

          <ReduxFormField
            name='password'
            type='password'
            placeholder='Enter password...'
            autoFocus
            autoComplete='current-password'
          />
        </ModalBody>
        <ModalFooter className='justify-content-between'>
          <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
          <Button type='submit' color='primary' disabled={submitting || invalid}>Continue</Button>
        </ModalFooter>
      </Form>
    )}
  </Modal>
))
