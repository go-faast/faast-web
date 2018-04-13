import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { withRouter } from 'react-router'

import { init } from 'Actions/app'
import { isAppReady, getAppError } from 'Selectors'
import LoadingFullscreen from 'Components/LoadingFullscreen'

// Import stylesheets here so they're noticed by HMR
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/global?nsm'
import 'faast-ui'

import AppView from './view'

export default compose(
  setDisplayName('App'),
  setPropTypes({
    ready: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
  }),
  withRouter,
  connect(createStructuredSelector({
    ready: isAppReady,
    error: getAppError,
  }), {
    initApp: init
  }),
  lifecycle({
    componentWillMount () {
      this.props.initApp()
    }
  }),
  hot(module)
)(({ ready, error }) => (
  ready ? (
    <AppView/>
  ) : (
    <LoadingFullscreen error={error}/>
  )
))
