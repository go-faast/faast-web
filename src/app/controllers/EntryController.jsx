import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import Entry from 'Views/Entry'
import idb from 'Utilities/idb'
import log from 'Utilities/log'
import { getAssets } from 'Actions/request'

class EntryController extends Component {
  constructor () {
    super()
    this.state = {
      ready: false
    }
  }

  componentWillMount () {
    const query = queryString.parse(window.location.search)
    if (query.log_level) window.faast.log_level = query.log_level

    idb.setup(['logging'])
    .then(() => {
      log.info('idb set up')
      if (query.export) {
        return idb.exportDb(query.export)
      } else {
        return Promise.resolve()
      }
    })
    .then(() => {
      return idb.removeOld('logging')
    })
    .then(() => {
      return this.props.getAssets()
    })
    .then(() => {
      this.setState({ ready: true })
    })
  }

  render () {
    return (
      <Entry ready={this.state.ready} loading={!this.state.ready || this.props.portfolio.loading} />
    )
  }
}

EntryController.propTypes = {
  portfolio: PropTypes.object.isRequired,
  getAssets: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio
})

const mapDispatchToProps = (dispatch) => ({
  getAssets: () => {
    return dispatch(getAssets())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EntryController)
