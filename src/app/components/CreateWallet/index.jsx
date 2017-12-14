import React, { Component } from 'react'
import CreateWalletView from './view'

class CreateWallet extends Component {
  constructor () {
    super()
    this.state = {
      showPasswordModal: false
    }
    this._handleClick = this._handleClick.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
  }

  _handleClick () {
    this._toggleModal()
  }

  _toggleModal () {
    this.setState({ showPasswordModal: !this.state.showPasswordModal })
  }

  render () {
    const modalProps = {
      showModal: this.state.showPasswordModal,
      toggleModal: this._toggleModal,
      isNewWallet: true
    }
    return (
      <CreateWalletView
        handleClick={this._handleClick}
        modalProps={modalProps}
      />
    )
  }
}

export default CreateWallet
