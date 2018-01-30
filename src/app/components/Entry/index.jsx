/* eslint-disable new-cap */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EntryView from './view'
import toastr from 'Utilities/toastrWrapper'
import { init } from 'Actions/app'
import { isAppReady, getAppError } from 'Selectors'

class Entry extends Component {

  componentWillMount () {
    this.props.initApp().catch((e) => toastr.error(e, { timeOut: 0, removeOnHover: false }))
  }

  render () {
    return (<EntryView {...this.props} />)
  }
}

Entry.propTypes = {
  ready: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
}

const mapStateToProps = (state) => ({
  ready: isAppReady(state),
  error: getAppError(state),
})

const mapDispatchToProps = { initApp: init }

export default connect(mapStateToProps, mapDispatchToProps)(Entry)
