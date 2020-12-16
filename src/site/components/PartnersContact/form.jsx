import React, { Fragment } from 'react'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import Faast from 'Services/Faast'
import ReduxFormField from 'Components/ReduxFormField'
import Toastr from 'Utilities/toastrWrapper'
import classNames from 'class-names'

import { input, text } from 'Components/Affiliate/style'

const PartnersContactForm = ({ handleSubmit, isSubmitting, hasSubmitted }) => {
  return hasSubmitted ? (
    <Fragment>
      <h1 style={{ fontSize: 50 }}>🎉</h1>
      <p className={classNames('my-4', text)}>Your info has been submitted. We will be in contact shortly!</p>
    </Fragment>
  ) : (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='email'
        type='text'
        placeholder='Email Address'
        inputClass={classNames('flat', input)}
      />
      <ReduxFormField
        name='company'
        type='text'
        placeholder='Organization Name'
        inputClass={classNames('flat', input)}
      />
      <ReduxFormField
        name='product'
        type='textarea'
        placeholder='Product Description'
        inputClass={classNames('flat', input)}
      />
      <Button className='w-100 flat' color='primary' type='submit' disabled={isSubmitting}>Submit</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('PartnersContactForm'),
  withState('isSubmitting', 'updateIsSubmitting', false),
  withState('hasSubmitted', 'updateHasSubmitted', false),
  withHandlers({
    onSubmit: ({ updateIsSubmitting, updateHasSubmitted }) => async ({ email, company, product }) => {
      try {
        updateIsSubmitting(true)
        await Faast.postPartners({ email, company, product })
        updateIsSubmitting(false)
        updateHasSubmitted(true)
      } catch (err) {
        Toastr.error('There was an issue submitting your information. Please try again later.')
        updateIsSubmitting(false)
      }
    }
  }),
  reduxForm({
    form: 'partners_contact',
  }),
)(PartnersContactForm)