import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'

import { input, text } from '../style'

import { register } from 'Actions/affiliate'
import { areSwapsLoading } from 'Selectors'

const MakerSignupForm = ({ handleSubmit, areSwapsLoading }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='email'
        type='email'
        placeholder='Email Address'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Email Address</p></small>}
      />
      <ReduxFormField
        name='name'
        type='text'
        placeholder='Full Name'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Full Name</p></small>}
      />
      <ReduxFormField
        name='publicName'
        type='text'
        placeholder='Public Maker Name'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Public Maker Name</p></small>}
      />
      <ReduxFormField
        name='password'
        type='password'
        placeholder='Password'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Password</p></small>}
      />
      <ReduxFormField
        name='confirmPassword'
        type='confirmPassword'
        placeholder='Confirm Password'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Confirm Password</p></small>}
      />
      <Button className='w-100 flat' color='primary' type='submit' disabled={areSwapsLoading}>Signup</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('MakerSignupForm'),
  connect(createStructuredSelector({
    areSwapsLoading: areSwapsLoading,
  }), {
    register
  }),
  withHandlers({
    onSubmit: () => () => {
      // register
    }
  }),
  reduxForm({
    form: 'maker_signup',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(MakerSignupForm)
