import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import Entry from 'Views/Entry'
import idb from 'Utilities/idb'
import log from 'Utilities/log'
import { sessionStorageGet, sessionStorageSet } from 'Utilities/helpers'
import { parseEncryptedWalletString, parseHardwareWalletString } from 'Utilities/wallet'
import { setEncryptedWallet, setHardwareWallet } from 'Actions/redux'
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
      log.info('logging db started')
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
      let encryptedWallet
      if (query.wallet) {
        const encryptedWalletString = Buffer.from(query.wallet, 'base64').toString()
        encryptedWallet = parseEncryptedWalletString(encryptedWalletString)
        sessionStorageSet('encryptedWallet', encryptedWalletString)
      } else {
        encryptedWallet = parseEncryptedWalletString(sessionStorageGet('encryptedWallet'))
      }
      if (encryptedWallet) {
        this.props.setEncryptedWallet(encryptedWallet)
      } else {
        const hardwareWallet = parseHardwareWalletString(sessionStorageGet('hardwareWallet'))
        if (hardwareWallet) this.props.setHardwareWallet(hardwareWallet)
      }
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
  getAssets: PropTypes.func.isRequired,
  setEncryptedWallet: PropTypes.func.isRequired,
  setHardwareWallet: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  swap: state.swap,
  portfolio: state.portfolio
})

const mapDispatchToProps = (dispatch) => ({
  getAssets: () => {
    return dispatch(getAssets())
  },
  setEncryptedWallet: (encryptedWallet) => {
    dispatch(setEncryptedWallet(encryptedWallet))
  },
  setHardwareWallet: (hardwareWallet) => {
    dispatch(setHardwareWallet(hardwareWallet))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EntryController)
