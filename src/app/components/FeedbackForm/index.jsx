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
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'

const FORM_NAME = 'feedback_form'
const getFormValue = formValueSelector(FORM_NAME)

const FeedbackForm = ({ validateRequired, selectedType, handleSubmit, 
  shouldShowFeedbackForm, doToggleFeedbackForm, t }) => {
  const placeholder = {
    feature: t('app.feedbackForm.featurePlaceholder', 'Please describe the feature you would like added to Faa.st...'),
    design: t('app.feedbackForm.designPlaceholder', 'Please describe what you like or dislike about the Faa.st design...'),
    bug: t('app.feedbackForm.bugPlaceholder', 'Please describe any bugs you encountered using Faa.st...'),
    other: t('app.feedbackForm.otherPlaceholder', 'Please provide your feedback here...'),
  }
  return (
    <Modal
      isOpen={shouldShowFeedbackForm}
      size='md' 
      toggle={() => doToggleFeedbackForm()} 
      className='mt-6 mx-md-auto' 
      contentClassName='p-0'
    >
      <ModalHeader tag='h4' toggle={() => doToggleFeedbackForm()} className='text-primary'>
        <T tag='span' i18nKey='app.feedbackForm.faastFeedback'>Faa.st Feedback</T>
      </ModalHeader>
      <ModalBody className='p-0 p-sm-3'>
        <Form onSubmit={handleSubmit}>
          <ReduxFormField
            name='type'
            type='select'
            requiredLabel
            validate={validateRequired}
            label={<T tag='span' i18nKey='app.feedbackForm.typeOfFeedback' className='text-muted'>Type of Feedback</T>}
          >
            <option value='' defaultValue disabled>{t('app.feedbackForm.selectType', 'Select type of feedback')}</option>
            <option value='asset'>{t('app.feedbackForm.asset','Request a new asset')}</option>
            <option value='feature'>{t('app.feedbackForm.feature','Feature request')}</option>
            <option value='design'>{t('app.feedbackForm.design','Feedback on design')}</option>
            <option value='support'>{t('app.feedbackForm.help','Help with a swap')}</option>
            <option value='bug'>{t('app.feedbackForm.bug','Report a bug')}</option>
            <option value='other'>{t('app.feedbackForm.other', 'Other')}</option>
          </ReduxFormField>
          {selectedType && selectedType !== 'support' && selectedType !== 'asset' && (
            <Fragment>
              <ReduxFormField
                name='description'
                requiredLabel
                validate={validateRequired}
                label={<T tag='span' i18nKey='app.feedbackForm.description' className='text-muted'>Feedback Description</T>}
                type='textarea'
                placeholder={placeholder[selectedType]}
              />
              <ReduxFormField
                label={<T tag='span' i18nKey='app.feedbackForm.email' className='text-muted'>Email For Reply</T>}
                name='email'
                type='text'
                placeholder={t('app.feedbackForm.emailPlaceholder', 'Email Address (optional)')}
              />
            </Fragment>
          )}
          {selectedType && selectedType == 'asset' && (
            <Fragment>
              <ReduxFormField
                label={<T tag='span' i18nKey='app.feedbackForm.assetName' className='text-muted'>Asset Name & Ticker</T>}
                name='assetName'
                requiredLabel
                validate={validateRequired}
                type='text'
                placeholder={t('app.feedbackForm.assetNamePlaceholder', 'Asset Name & Ticker')}
              />
              <ReduxFormField
                label={<T tag='span' i18nKey='app.feedbackForm.assetInfo' className='text-muted'>Asset Info URL</T>}
                name='assetUrl'
                type='text'
                placeholder={t('app.feedbackForm.assetInfoPlaceholder', 'Please provide a URL to info about asset...')}
              />
            </Fragment>
          )}
          {selectedType && selectedType == 'support' && (
            <T tag='span' i18nKey='app.feedbackForm.contactSupport' className='pb-3'>
              Please contact <span className='text-primary'>support@faa.st</span> with your swap ID so we can fix any issues regarding your swap!
            </T>
          )}
          <Button className='w-100 flat mt-3' color='primary' type='submit' disabled={selectedType == 'support'}>
            <T tag='span' i18nKey='app.feedbackForm.submitFeedback'>Submit Feedback</T>
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default compose(
  setDisplayName('FeedbackForm'),
  withTranslation(),
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
        change('type', 'asset')
        change('assetName', assetInitialValue)
      }
    }
  }),
  lifecycle({
    componentDidMount() {
      const { updateInitialValues, handleResetForm } = this.props
      handleResetForm()
      updateInitialValues()
    }
  }),
)((FeedbackForm))