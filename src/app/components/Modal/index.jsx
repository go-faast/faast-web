import React, { Component } from 'react'
import ModalView from './view'

class Modal extends Component {
  constructor () {
    super()
    this.state = {
      showModal: false
    }
    this._handleClick = this._handleClick.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
  }

  _handleClick () {
    this._toggleModal()
  }

  _toggleModal () {
    this.setState({ showModal: !this.state.showModal })
  }

  render () {
    const modalProps = {
      isOpen: this.state.showModal,
      toggle: this._toggleModal
    }
    return (
      <ModalView
        handleClick={this._handleClick}
        modalProps={modalProps}
        {...this.props}
      />
    )
  }
}

export default Modal
