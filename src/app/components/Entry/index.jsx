/* eslint-disable new-cap */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import EntryView from './view'
import idb from 'Utilities/idb'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { setWeb3 } from 'Utilities/wallet'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import { getAssets, getSwundle } from 'Actions/request'
import { openWallet } from 'Actions/portfolio'
import { setSettings } from 'Actions/redux'

class Entry extends Component {
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
      return new Promise((resolve) => {
        if (blockstack.isSignInPending()) {
          log.info('blockstack signin pending')
          blockstack.handlePendingSignIn()
          .then(() => {
            window.location.replace(filterUrl())
          })
          .catch((err) => {
            log.error(err)
            resolve()
          })
        } else {
          resolve()
        }
      })
    })
    .then(() => {
      return new Promise((resolve) => {
        if (this.props.wallet.type === 'blockstack') {
          blockstack.getSettings()
          .then((settings) => {
            this.props.setSettings(settings)
            resolve()
          })
          .catch((err) => {
            log.error(err)
            resolve()
          })
        } else {
          resolve()
        }
      })
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
      if (this.props.wallet.address && !this.props.swap.length) {
        this.props.getSwundle(this.props.wallet.address, this.props.mock.mocking)
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
      <EntryView
        ready={this.state.ready}
        loading={!this.state.ready || this.props.portfolio.loading}
        loadingProps={{
          hasError: this.state.hasError
        }}
      />
    )
  }
}

Entry.propTypes = {
  wallet: PropTypes.object.isRequired,
  portfolio: PropTypes.object.isRequired,
  getAssets: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  portfolio: state.portfolio,
  wallet: state.wallet,
  swap: state.swap,
  mock: state.mock
})

const mapDispatchToProps = (dispatch) => ({
  getAssets: () => {
    return dispatch(getAssets())
  },
  openWallet: (type, wallet, isMocking, noSessionStorage) => {
    dispatch(openWallet(type, wallet, isMocking, noSessionStorage))
  },
  setSettings: (settings) => {
    dispatch(setSettings(settings))
  },
  getSwundle: (address, isMocking) => {
    dispatch(getSwundle(address, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Entry)
