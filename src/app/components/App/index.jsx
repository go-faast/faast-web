import React, { Fragment } from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { withRouter } from 'react-router'

import { init } from 'Actions/app'
import { isAppReady, getAppError, isDefaultPortfolioEmpty, getSavedSwapWidgetInputs, shouldShowFeedbackForm } from 'Selectors'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import FeedbackForm from 'Components/FeedbackForm'

// Import stylesheets here so they're noticed by HMR
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'overlayscrollbars/css/OverlayScrollbars.css?nsm'
import 'Styles/global?nsm'
import 'faast-ui'

import T from 'Components/i18n/T'

import AppView from './view'

export default compose(
  setDisplayName('App'),
  withRouter,
  connect(createStructuredSelector({
    ready: isAppReady,
    error: getAppError,
    hasNoWallets: isDefaultPortfolioEmpty,
    previousSwapInputs: getSavedSwapWidgetInputs,
    showFeedbackForm: shouldShowFeedbackForm
  }), {
    initApp: init
  }),
  lifecycle({
    componentWillMount () {
      this.props.initApp()
    }
  }),
  hot(module)
)(({ ready, error, showFeedbackForm }) => (
  ready ? (
    <Fragment>
      <AppView/>
      {showFeedbackForm && (
        <FeedbackForm />
      )}
    </Fragment>
  ) : (
    <LoadingFullscreen label={<T tag='span' i18nKey='app.view.loadingFaast'>Loading Faa.st...</T>} error={error}/>
  )
))
