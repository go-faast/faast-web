/* eslint-disable new-cap */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import Entry from 'Views/Entry'
import idb from 'Utilities/idb'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { setWeb3 } from 'Utilities/wallet'
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
      if (window.Web3) {
        setWeb3(this.props.wallet.type)
      } else {
        throw new Error('Web3 not found')
      }
      window.faast.hw = {}
      if (window.TrezorConnect) {
        window.faast.hw.trezor = window.TrezorConnect
      }
      if (window.ledger) {
        window.ledger.comm_u2f.create_async()
        .then((comm) => {
          window.faast.hw.ledger = new window.ledger.eth(comm)
        })
        .fail(log.error)
      }

      return this.props.getAssets()
    })
    .then(() => {
      this.setState({ ready: true })
    })
    .catch((err) => {
      log.error(err)
      this.setState({ hasError: true })
      toastr.error(err.message || 'Unknown error', { timeOut: 0, removeOnHover: false })
    })
  }

  render () {
    return (
      <Entry
        ready={this.state.ready}
        loading={!this.state.ready || this.props.portfolio.loading}
        loadingProps={{
          hasError: this.state.hasError
        }}
      />
    )
  }
}

EntryController.propTypes = {
  wallet: PropTypes.object.isRequired,
  portfolio: PropTypes.object.isRequired,
  getAssets: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio,
  wallet: state.wallet
})

const mapDispatchToProps = (dispatch) => ({
  getAssets: () => {
    return dispatch(getAssets())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EntryController)
