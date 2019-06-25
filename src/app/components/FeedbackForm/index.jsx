import React, { Fragment } from 'react'
import { pick } from 'lodash'
import { connect } from 'react-redux'
import * as validator from 'Utilities/validator'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Modal, ModalHeader, ModalBody, Form, Button } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import { postFeedbackForm } from 'Actions/app'

const FORM_NAME = 'feedback_form'
const getFormValue = formValueSelector(FORM_NAME)

const FeedbackForm = ({ validateRequired, selectedType, handleSubmit, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
      Faa.st Feedback
      </ModalHeader>
      <ModalBody className='p-0 p-sm-3'>
        <Form onSubmit={handleSubmit}>
          <ReduxFormField
            name='type'
            type='select'
            requiredLabel
            validate={validateRequired}
            label={<span className='text-muted'>Type of Feedback</span>}
          >
            <option value='' defaultValue disabled>Select type of feedback</option>
            <option value='design'>Feedback on design</option>
            <option value='asset'>Request a new asset</option>
            <option value='feature'>Feature request</option>
            <option value='support'>I need help with a swap</option>
          </ReduxFormField>
          {selectedType && selectedType !== 'support' && (
            <Fragment>
              <ReduxFormField
                name='description'
                requiredLabel
                validate={validateRequired}
                label={<span className='text-muted'>Feedback Description</span>}
                type='textarea'
                placeholder={`Please provide your ${selectedType} feedback here...`}
              />
              <ReduxFormField
                label={<span className='text-muted'>Email For Reply</span>}
                name='email'
                type='text'
                placeholder='Email Address (optional)'
              />
            </Fragment>
          )}
          {selectedType && selectedType == 'support' && (
            <p className='pb-3'>
              Please contact <span className='text-primary'>support@faa.st</span> so we can fix any issues regarding your swap!
            </p>
          )}
          <Button className='w-100 flat mt-3' color='primary' type='submit' disabled={selectedType == 'support'}>Submit Feedback</Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default compose(
  setDisplayName('FeedbackForm'),
  connect(createStructuredSelector({
    selectedType: (state) => getFormValue(state, 'type'),
  }), {
    postFeedbackForm
  }),
  withHandlers({
    validateRequired: () => validator.all(
      validator.required('This field is required.'),
    ),
    onSubmit: ({ postFeedbackForm }) => ({ type, description, email }) => {
      postFeedbackForm(type, description, email)
    }
  }),
  reduxForm({
    form: FORM_NAME,
    initalValues: {
      type: ''
    }
  }),
)((FeedbackForm))