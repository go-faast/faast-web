import React, { Component } from 'react'
import { connect } from 'react-redux'
import Welcome from 'Views/Welcome'
import { setSettings } from 'Actions/redux'

class WelcomeController extends Component {
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
    if (this.props.wallet.type === 'blockstack') {
      this.props.setSettings({ walletBackedUp: true })
    }
  }

  render () {
    const modalProps = {
      showModal: this.props.wallet.type === 'blockstack' && !this.props.settings.walletBackedUp,
      toggleModal: this._toggleModal,
      handleBackup: () => this.setState({ view: 'downloadKeystore' }),
      handleContinue: this._handleContinue
    }
    return (
      <Welcome
        view={this.state.view}
        modalProps={modalProps}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  settings: state.settings
})

const mapDispatchToProps = (dispatch) => ({
  setSettings: (settings) => {
    dispatch(setSettings(settings))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeController)
