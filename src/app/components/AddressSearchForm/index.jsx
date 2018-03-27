import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Form, InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'

let AddressSearchForm = ({ handleSubmit, className, formProps, buttonSize }) => (
  <Form onSubmit={handleSubmit} className={className} {...formProps}>
    <InputGroup>
      <Input
        tag={Field}
        component='input'
        name='address'
        type='search'
        autoCorrect={false}
        autoCapitalize={false}
        spellCheck={false}
        placeholder='Search by address...'
      />
      <InputGroupAddon addonType="append">
        <Button color='primary' outline type='submit' size={buttonSize}><i className='fa fa-search fa'></i></Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
)

AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(AddressSearchForm)

AddressSearchForm.propTypes = {
  ...AddressSearchForm.propTypes,
  formProps: PropTypes.object,
  placeholder: PropTypes.string,
  buttonSize: PropTypes.string
}

AddressSearchForm.defaultProps = {
  formProps: {},
  placeholder: 'Search by address...',
  buttonSize: 'lg'
}

export default AddressSearchForm