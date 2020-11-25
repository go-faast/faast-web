import React from 'react'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { Button } from 'reactstrap'

import { withAuth } from 'Components/Auth'

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
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    onSubmit: ({ auth, updateIsLoading }) => () => {
      updateIsLoading(true)
      auth.login()
      updateIsLoading(false)
    }
  }),
)(MakerLoginForm)
