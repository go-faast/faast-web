import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Form, InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'

const AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(({
  handleSubmit, size, placeholder, className,
  formProps, inputProps, inputGroupProps, buttonProps
}) => (
  <Form onSubmit={handleSubmit} className={className} {...formProps}>
    <InputGroup {...inputGroupProps}>
      <Input
        tag={Field}
        component='input'
        name='address'
        type='search'
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        placeholder={placeholder}
        {...inputProps}
      />
      <InputGroupAddon addonType="append">
        <Button color='primary' outline type='submit' size={size} {...buttonProps}><i className='fa fa-search fa'></i></Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
))

AddressSearchForm.propTypes = {
  ...AddressSearchForm.propTypes,
  size: PropTypes.string,
  placeholder: PropTypes.string,
  formProps: PropTypes.object,
  inputProps: PropTypes.object,
  inputGroupProps: PropTypes.object,
  buttonProps: PropTypes.object,
}

AddressSearchForm.defaultProps = {
  size: 'lg',
  placeholder: 'Search by address...',
  formProps: {},
  inputProps: {},
  inputGroupProps: {},
  buttonProps: {},
}

export default AddressSearchForm
