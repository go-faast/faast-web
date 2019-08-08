import React from 'react'
import * as validator from 'Utilities/validator'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'

import style from './style.scss'

import classNames from 'class-names'

const FORM_NAME = 'email_form'
//const getFormValue = formValueSelector(FORM_NAME)

const EmailSub = ({ handleSubmit, }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        className='text-center'
        label={<p style={{ color: '#EFEFEF', fontSize: 18 }}>Sign up to learn more about Faa.st</p>}
        labelClass='w-100 text-center'
        name='email'
        inputClass={classNames('flat mx-auto', style.input)}
        type='text'
        placeholder='Email Address'
        inputGroupClass='flat mx-auto position-relative'
        inputGroupStyle={{ maxWidth: 495 }}
        addonAppend={() => (
          <Button 
            className={classNames('flat position-absolute text-center p-0')} 
            style={{ top: 0, right: 0, width: 120,
              height: '100%', backgroundColor: '#D5ECE8',
              border: 'none', color: '#16AD94',
              fontSize: 14, fontWeight: 600, zIndex: 99999 }}
            color='primary' 
            type='submit' 
          >
            Subscribe
          </Button>
        )
        }
      />
    </Form>
  )
}

export default compose(
  setDisplayName('EmailSub'),
  withHandlers({
    validateRequired: () => validator.all(
      validator.required('This field is required.'),
    ),
    onSubmit: () => ({  email }) => {
      console.log(email)
    }
  }),
  reduxForm({
    form: FORM_NAME,
  }),
)((EmailSub))