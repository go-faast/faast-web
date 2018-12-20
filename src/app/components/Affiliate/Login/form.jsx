import React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'

import { input } from '../style'

import { affiliateLogin } from 'Actions/affiliate'

const AffiliateLoginForm = ({ handleSubmit }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='affiliateId'
        type='text'
        placeholder='Affiliate Id'
        inputClass={classNames('flat', input)}
      />
      <ReduxFormField
        name='secretKey'
        type='password'
        placeholder='Secret Key'
        inputClass={classNames('flat', input)}
      />
      <Button className='w-100 flat' color='primary' type='submit'>Login</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('AffiliateLoginForm'),
  connect(null, {
    login: affiliateLogin
  }),
  withHandlers({
    onSubmit: ({ login }) => ({ affiliateId, secretKey }) => {
      login(affiliateId, secretKey)
    }
  }),
  reduxForm({
    form: 'affiliate_login',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(AffiliateLoginForm)
