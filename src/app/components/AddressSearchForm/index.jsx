import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Form, InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'

let AddressSearchForm = ({ handleSubmit }) => (
  <Form onSubmit={handleSubmit} className='w-100'>
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
        <Button color='primary' size='lg' outline type='submit'><i className='fa fa-search fa'></i></Button>
      </InputGroupAddon>
    </InputGroup>
  </Form>
)

AddressSearchForm = reduxForm({
  form: 'addressSearchForm'
})(AddressSearchForm)

AddressSearchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}

AddressSearchForm.defaultProps = {
  placeholder: 'Search by address...'
}

export default AddressSearchForm