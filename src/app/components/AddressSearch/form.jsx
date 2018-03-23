import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { Form, InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'

let AddressSearchForm = (props) => (
  <Form onSubmit={props.handleSubmit} className='w-100'>
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

export default AddressSearchForm