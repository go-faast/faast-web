import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import { getAllSwapsArray, isCurrentSwundleReadyToSign } from 'Selectors'
import { sendSwapDeposits } from 'Actions/portfolio'
import { resetSwaps } from 'Actions/swap'
import { toggleOrderModal } from 'Actions/redux'

import SignTxModalView from './view'

class SignTxModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isSigning: false
    }
    this.handleDone = this.handleDone.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleDone (success = false) {
    const { toggle, resetSwaps } = this.props
    closeTrezorWindow()
    this.setState({ isSigning: false })
    toggle()
    if (!success) {
      resetSwaps()
    }
  }

  handleCancel () {
    this.handleDone(false)
  }

  handleSubmit (values, dispatch) {
    this.setState({ isSigning: true })

    const { swaps } = this.props
    return dispatch(sendSwapDeposits(swaps))
      .then(() => {
        this.handleDone(true)
        dispatch(push('/dashboard'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        this.handleDone(false)
      })
  }

  render () {
    const { isSigning } = this.state
    return (
      <SignTxModalView
        isSigning={isSigning}
        onSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  swaps: getAllSwapsArray,
  readyToSign: isCurrentSwundleReadyToSign,
  isOpen: ({ orderModal: { show } }) => show,
})

const mapDispatchToProps = {
  resetSwaps,
  toggle: toggleOrderModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(SignTxModal)
