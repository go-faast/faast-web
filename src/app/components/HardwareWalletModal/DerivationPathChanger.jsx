import React from 'react'
import { compose, setDisplayName, withState, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { changeDerivationPath } from 'Actions/connectHardwareWallet'
import { getDerivationPath } from 'Selectors/connectHardwareWallet'

import ReduxFormField from 'Components/ReduxFormField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'

const DerivationPathForm = reduxForm({
  form: 'derivationPathChanger'
})(({ handleSubmit, t, validateDerivationPath }) => (
  <Form onSubmit={handleSubmit}>
    <ReduxFormField
      name='derivationPath'
      label='Derivation path'
      placeholder={t('app.derivationPath.derivationPathPlaceholder', 'Derivation path')}
      type='text'
      bsSize='md'
      autoCorrect='false'
      autoCapitalize='false'
      spellCheck='false'
      validate={validateDerivationPath}
      addonAppend={({ invalid }) => (
        <Button color='primary' size='md' outline type='submit' disabled={invalid}>
          <i className='fa fa-level-down fa-rotate-90' />
        </Button>
      )}
    />
  </Form>
))

export default compose(
  setDisplayName('DerivationPathChanger'),
  withTranslation(),
  connect(createStructuredSelector({
    derivationPath: getDerivationPath
  }), {
    changeDerivationPath,
  }),
  withState('showForm', 'setShowForm', false),
  withHandlers({
    toggleShowForm: ({ showForm, setShowForm }) => () => {
      setShowForm(!showForm)
    },
    handleSubmit: ({ derivationPath, changeDerivationPath, setShowForm }) => (values) => {
      const { derivationPath: newPath } = values
      setShowForm(false)
      if (newPath !== derivationPath) {
        changeDerivationPath(newPath)
      }
    },
    validateDerivationPath: ({ t }) => (path) => {
      if (!(typeof path === 'string'
            && /^[a-z](\/[0-9]+'?)+$/.test(path.trim()))) {
        return t('app.derivationPath.invalidError' ,'Invalid derivation path')
      }
    }
  })
)(({ derivationPath, showForm, toggleShowForm, handleSubmit, t, validateDerivationPath }) => showForm
  ? (<DerivationPathForm
    t={t}
    onSubmit={handleSubmit}
    validateDerivationPath={validateDerivationPath}
    initialValues={{ derivationPath }}/>)
  : (<Button color='dark' className='mx-auto' onClick={toggleShowForm}>
    <T tag='span' i18nKey='app.hardwareWalletModal.derivationPath.change'>Change derivation path</T>
  </Button>)
)
