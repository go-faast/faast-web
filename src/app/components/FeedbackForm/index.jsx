import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import * as validator from 'Utilities/validator'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers, lifecycle } from 'recompose'
import { Modal, ModalHeader, ModalBody, Form, Button } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import { postFeedbackForm, doToggleFeedbackForm } from 'Actions/app'
import { shouldShowFeedbackForm, feedbackFormRequestedAsset } from 'Selectors/app'

const FORM_NAME = 'feedback_form'
const getFormValue = formValueSelector(FORM_NAME)

const placeholder = {
  feature: 'Please describe the feature you would like added to Faa.st...',
  design: 'Please describe what you like or dislike about the Faa.st design...',
  bug: 'Please describe any bugs you encountered using Faa.st...',
  other: 'Please provide your feedback here...',
}

const FeedbackForm = ({ validateRequired, selectedType, handleSubmit, 
  shouldShowFeedbackForm, doToggleFeedbackForm }) => {
  return (
    <Modal
      isOpen={shouldShowFeedbackForm}
      size='md' 
      toggle={() => doToggleFeedbackForm()} 
      className='mt-6 mx-md-auto' 
      contentClassName='p-0'
    >
      <ModalHeader tag='h4' toggle={() => doToggleFeedbackForm()} className='text-primary'>
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
            <option value='asset'>Request a new asset</option>
            <option value='feature'>Feature request</option>
            <option value='design'>Feedback on design</option>
            <option value='support'>Help with a swap</option>
            <option value='bug'>Report a bug</option>
            <option value='other'>Other</option>
          </ReduxFormField>
          {selectedType && selectedType !== 'support' && selectedType !== 'asset' && (
            <Fragment>
              <ReduxFormField
                name='description'
                requiredLabel
                validate={validateRequired}
                label={<span className='text-muted'>Feedback Description</span>}
                type='textarea'
                placeholder={placeholder[selectedType]}
              />
              <ReduxFormField
                label={<span className='text-muted'>Email For Reply</span>}
                name='email'
                type='text'
                placeholder='Email Address (optional)'
              />
            </Fragment>
          )}
          {selectedType && selectedType == 'asset' && (
            <Fragment>
              <ReduxFormField
                label={<span className='text-muted'>Asset Name & Ticker</span>}
                name='assetName'
                requiredLabel
                validate={validateRequired}
                type='text'
                placeholder='Asset Name & Ticker'
              />
              <ReduxFormField
                label={<span className='text-muted'>Asset Info URL</span>}
                name='assetUrl'
                type='text'
                placeholder='Please provide a URL to info about asset...'
              />
            </Fragment>
          )}
          {selectedType && selectedType == 'support' && (
            <p className='pb-3'>
              Please contact <span className='text-primary'>support@faa.st</span> with your swap ID so we can fix any issues regarding your swap!
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
    shouldShowFeedbackForm,
    assetInitialValue: feedbackFormRequestedAsset
  }), {
    postFeedbackForm,
    doToggleFeedbackForm
  }),
  withHandlers({
    onSubmit: ({ postFeedbackForm }) => ({ type, description, email, assetName, assetUrl }) => {
      postFeedbackForm(type, description, email, assetName, assetUrl)
    },
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    initalValues: {
      type: '',
      asset: undefined
    },
  }),
  withHandlers({
    handleResetForm: ({ reset }) => () => {
      reset()
    },
    validateRequired: () => validator.all(
      validator.required('This field is required.'),
    ),
    updateInitialValues: ({ change, assetInitialValue }) => () => {
      if (assetInitialValue) {
        console.log('updateInitialValues')
        change('type', 'asset')
        change('assetName', assetInitialValue)
      }
    }
  }),
  lifecycle({
    componentDidMount() {
      const { updateInitialValues, handleResetForm } = this.props
      console.log('didMount')
      handleResetForm()
      updateInitialValues()
    }
  }),
)((FeedbackForm))