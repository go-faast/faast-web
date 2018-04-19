import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getCurrentWallet } from 'Selectors'
import { setSettings } from 'Actions/redux'
import { removeWallet } from 'Actions/wallet'

import WelcomeView from './view'

class Welcome extends Component {
  constructor (props) {
    super(props)
    this.state = {
      view: 'welcome'
    }
    this._toggleModal = this._toggleModal.bind(this)
    this._handleContinue = this._handleContinue.bind(this)
  }

  _toggleModal () {
    this.setState({ view: 'welcome' })
  }

  _handleContinue () {
    if (this.props.wallet.isBlockstack) {
      this.props.setSettings({ walletBackedUp: true })
    }
  }

  render () {
    const { wallet, settings, removeWallet } = this.props
    const modalProps = {
      address: wallet.address,
      showModal: wallet.isBlockstack && !settings.walletBackedUp,
      toggleModal: this._toggleModal,
      handleBackup: () => this.setState({ view: 'downloadKeystore' }),
      handleClose: () => removeWallet(wallet.id),
      handleContinue: this._handleContinue,
    }
    return (
      <WelcomeView
        view={this.state.view}
        modalProps={modalProps}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  wallet: getCurrentWallet(state),
  settings: state.settings
})

const mapDispatchToProps = {
  setSettings,
  removeWallet
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)
