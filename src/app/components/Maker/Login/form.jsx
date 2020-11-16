import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { Button } from 'reactstrap'

import { withAuth } from 'Components/Auth'

import { affiliateLogin } from 'Actions/affiliate'

const MakerLoginForm = ({ onSubmit, isLoading }) => {
  return (
    <Button 
      className='w-100 flat' 
      color='primary' 
      type='submit'
      onClick={onSubmit}
      disabled={isLoading}
    >
      Login
    </Button>
  )
}

export default compose(
  setDisplayName('MakerLoginForm'),
  withAuth(),
  connect(createStructuredSelector({
  }), {
    login: affiliateLogin
  }),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    onSubmit: ({ auth, updateIsLoading }) => () => {
      updateIsLoading(true)
      auth.login()
      updateIsLoading(false)
    }
  }),
)(MakerLoginForm)
