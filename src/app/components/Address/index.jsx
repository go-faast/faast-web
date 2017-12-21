import React, { Component } from 'react'
import AddressView from './view'

class Address extends Component {
  constructor () {
    super()
    this.state = {
      showModal: false,
      view: 'address'
    }
    this._handleClick = this._handleClick.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
  }

  _handleClick () {
    this._toggleModal()
  }

  _toggleModal () {
    const view = !this.state.showModal ? 'address' : this.state.view
    this.setState({ showModal: !this.state.showModal, view })
  }

  render () {
    const modalProps = {
      showModal: this.state.showModal,
      toggleModal: this._toggleModal,
      handleDownloadKeystore: () => this.setState({ view: 'downloadKeystore' })
    }
    return (
      <AddressView
        view={this.state.view}
        handleClick={this._handleClick}
        modalProps={modalProps}
        {...this.props}
      />
    )
  }
}

export default Address
