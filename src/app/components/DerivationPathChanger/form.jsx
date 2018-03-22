import React from 'react'
import { reduxForm } from 'redux-form'
import { Field } from 'redux-form'
import { Button, Form, FormGroup, FormFeedback, Label, Input, InputGroup, InputGroupAddon } from 'reactstrap'

const validateDerivationPath = (path) => {
  if (!(typeof path === 'string'
        && /^[a-z](\/[0-9]+'?)+$/.test(path.trim()))) {
    return 'Invalid derivation path'
  }
}

const RenderInput = ({ input, label, type, meta: { touched, error, warning } }) => {
  const invalid = touched && (error || warning)
  return (
    <FormGroup>
      <Label for={input.name}>{label}</Label>
      <InputGroup>
        <Input {...input} className='text-center' placeholder={label} type={type} valid={invalid ? false : undefined}/>
        <InputGroupAddon addonType="append">
          <Button color='primary' size='md' outline type='submit' disabled={invalid}>
            <i className='fa fa-level-down fa-rotate-90' />
          </Button>
        </InputGroupAddon>
        {touched && (
          (error && <FormFeedback>{error}</FormFeedback>) ||
          (warning && <FormFeedback className='text-warning'>{warning}</FormFeedback>)
        )}
      </InputGroup>
    </FormGroup>
  )
}

export default reduxForm({
  form: 'derivationPathForm'
})(({ handleSubmit }) => (
  <Form onSubmit={handleSubmit}>
    <Field
      component={RenderInput}
      name='derivationPath'
      label='Derivation path'
      type='text'
      bsSize='md'
      autoCorrect={false}
      autoCapitalize={false}
      spellCheck={false}
      validate={validateDerivationPath}
    />
  </Form>
))
