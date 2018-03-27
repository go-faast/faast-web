import React from 'react'
import { reduxForm } from 'redux-form'
import { Button, Form, InputGroupAddon } from 'reactstrap'

import ReduxFormField from 'Components/ReduxFormField'

const validateDerivationPath = (path) => {
  if (!(typeof path === 'string'
        && /^[a-z](\/[0-9]+'?)+$/.test(path.trim()))) {
    return 'Invalid derivation path'
  }
}

export default reduxForm({
  form: 'derivationPathForm'
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
        <InputGroupAddon addonType="append">
          <Button color='primary' size='md' outline type='submit' disabled={invalid}>
            <i className='fa fa-level-down fa-rotate-90' />
          </Button>
        </InputGroupAddon>
      )}
    />
  </Form>
))
