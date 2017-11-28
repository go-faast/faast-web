import React, { Component } from 'react'
import CreateWallet from 'Views/CreateWallet'

class CreateWalletController extends Component {
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
      <CreateWallet
        handleClick={this._handleClick}
        modalProps={modalProps}
      />
    )
  }
}

export default CreateWalletController
