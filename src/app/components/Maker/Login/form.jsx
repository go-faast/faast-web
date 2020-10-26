import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'
import { useAuth0 } from '@auth0/auth0-react'

import { input } from '../style'

import { affiliateLogin } from 'Actions/affiliate'
import { areSwapsLoading } from 'Selectors'

const MakerLoginForm = ({ areSwapsLoading, onSubmit }) => {
  const { isLoading, loginWithRedirect } = useAuth0()
  return (
    <Button 
      className='w-100 flat' 
      color='primary' 
      type='submit'
      onClick={() => loginWithRedirect()}
      disabled={isLoading || areSwapsLoading}
    >
      Login
    </Button>
  )
}

export default compose(
  setDisplayName('MakerLoginForm'),
  connect(createStructuredSelector({
    areSwapsLoading: areSwapsLoading,
  }), {
    login: affiliateLogin
  }),
  withHandlers({
    onSubmit: () => () => {
      const { loginWithRedirect } = useAuth0()
      loginWithRedirect()
    }
  }),
)(MakerLoginForm)
