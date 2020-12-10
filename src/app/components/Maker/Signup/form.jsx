import React from 'react'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { Button } from 'reactstrap'

import { withAuth } from 'Components/Auth'

const MakerRegisterForm = ({ onSubmit, isLoading }) => {
  return (
    <Button 
      className='w-100 flat' 
      color='primary' 
      type='submit'
      onClick={onSubmit}
      disabled={isLoading}
    >
      Register
    </Button>
  )
}

export default compose(
  setDisplayName('MakerRegisterForm'),
  withAuth(),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    onSubmit: ({ auth, updateIsLoading }) => () => {
      updateIsLoading(true)
      auth.signUp()
      updateIsLoading(false)
    }
  }),
)(MakerRegisterForm)
