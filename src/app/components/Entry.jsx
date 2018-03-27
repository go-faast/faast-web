/* eslint-disable new-cap */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'
import { hot } from 'react-hot-loader'

// Import stylesheets here so they're noticed by HMR
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/global?nsm'
import 'faast-ui'

import { init } from 'Actions/app'
import { isAppReady, getAppError } from 'Selectors'
import App from 'Components/App'
import LoadingFullscreen from 'Components/LoadingFullscreen'

class Entry extends Component {

  componentWillMount () {
    this.props.initApp()
  }

  render () {
    const { ready, error } = this.props
    return ready ? (
      <Route component={App} />
    ) : (
      <LoadingFullscreen error={error} />
    )
  }
}

Entry.propTypes = {
  ready: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({
  ready: isAppReady(state),
  error: getAppError(state),
})

const mapDispatchToProps = { initApp: init }

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(Entry))
