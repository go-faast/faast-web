import React, { Fragment } from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'

import { init } from 'Actions/app'
import { isAppReady, getAppError } from 'Selectors'
import LoadingFullscreen from 'Components/LoadingFullscreen'

// Import stylesheets here so they're noticed by HMR
import 'react-redux-toastr/src/styles/index.scss?nsm'
import '../../styles/global?nsm'
import 'faast-ui'

import Widget from '../Widget'

export default compose(
  setDisplayName('App'),
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
    <Fragment>
      <Widget/>
    </Fragment>
  ) : (
    <LoadingFullscreen bgColor='#fff' label={'Loading Widget'} error={error}/>
  )
))
