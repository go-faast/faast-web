import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'

import { input } from '../style'

import { affiliateLogin } from 'Actions/affiliate'
import { areSwapsLoading } from 'Selectors'

const AffiliateLoginForm = ({ handleSubmit, areSwapsLoading }) => {
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
      <Button className='w-100 flat' color='primary' type='submit' disabled={areSwapsLoading}>Login</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('AffiliateLoginForm'),
  connect(createStructuredSelector({
    areSwapsLoading: areSwapsLoading,
  }), {
    login: affiliateLogin
  }),
  withHandlers({
    onSubmit: ({ login }) => ({ affiliateId, secretKey }) => {
      login(affiliateId, secretKey)
    }
  }),
  reduxForm({
    form: 'affiliate_login',
  }),
)(AffiliateLoginForm)
