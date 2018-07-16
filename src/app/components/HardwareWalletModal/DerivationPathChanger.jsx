import React from 'react'
import { compose, setDisplayName, withState, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { changeDerivationPath } from 'Actions/connectHardwareWallet'
import { getDerivationPath } from 'Selectors/connectHardwareWallet'

import ReduxFormField from 'Components/ReduxFormField'

const validateDerivationPath = (path) => {
  if (!(typeof path === 'string'
        && /^[a-z](\/[0-9]+'?)+$/.test(path.trim()))) {
    return 'Invalid derivation path'
  }
}

const DerivationPathForm = reduxForm({
  form: 'derivationPathChanger'
})(({ handleSubmit }) => (
  <Form onSubmit={handleSubmit}>
    <ReduxFormField
      name='derivationPath'
      label='Derivation path'
      placeholder='Derivation path'
      type='text'
      bsSize='md'
      autoCorrect={false}
      autoCapitalize={false}
      spellCheck={false}
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
    }
  })
)(({ derivationPath, showForm, toggleShowForm, handleSubmit }) => showForm
  ? (<DerivationPathForm
      onSubmit={handleSubmit}
      initialValues={{ derivationPath }}/>)
  : (<Button color='link' className='mx-auto' onClick={toggleShowForm}>
      Change derivation path
    </Button>)
)
