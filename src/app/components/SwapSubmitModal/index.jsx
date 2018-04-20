import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import {
  getAllSwapsArray, doesCurrentSwundleRequireSigning,
  isCurrentSwundleReadyToSign, isCurrentSwundleReadyToSend,
} from 'Selectors'
import { signSwapTxs, sendSwapTxs } from 'Actions/swap'
import { resetSwaps } from 'Actions/swap'
import { toggleOrderModal } from 'Actions/redux'

import SwapSubmitModalView from './view'

class SwapSubmitModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      startedSigning: false,
      startedSending: false,
    }
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSignTxs = this.handleSignTxs.bind(this)
    this.handleSendTxs = this.handleSendTxs.bind(this)
  }

  handleCancel () {
    const { toggle, resetSwaps } = this.props
    this.setState({
      startedSigning: false
    })
    closeTrezorWindow()
    toggle()
    resetSwaps()
  }

  handleSignTxs () {
    const { swaps, signSwapTxs } = this.props
    this.setState({ startedSigning: true })
    signSwapTxs(swaps)
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        closeTrezorWindow()
      })
  }

  handleSendTxs () {
    const { swaps, sendSwapTxs, toggle, routerPush } = this.props
    this.setState({ startedSending: true })
    sendSwapTxs(swaps)
      .then((updatedSwaps) => {
        if (updatedSwaps.every((swap) => swap.tx.sent)) {
          toggle()
          routerPush('/dashboard')
        }
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
      })
  }

  render () {
    const { requiresSigning, readyToSign, readyToSend } = this.props
    const { startedSigning, startedSending } = this.state
    log.debug({ ...this.props, ...this.state })
    const showSubmit = !requiresSigning || startedSigning // True if continue button triggers tx sending, false for signing
    const continueDisabled = showSubmit ? (!readyToSend || startedSending) : (!readyToSign || startedSigning)
    const continueLoading = showSubmit ? startedSending : startedSigning
    const continueHandler = showSubmit ? this.handleSendTxs : this.handleSignTxs
    const continueText = showSubmit ? 'Submit all' : 'Begin signing'
    const headerText = showSubmit ? 'Confirm and Submit' : 'Review and Sign'
    return (
      <SwapSubmitModalView
        headerText={headerText}
        continueDisabled={continueDisabled}
        continueLoading={continueLoading}
        continueText={continueText}
        handleContinue={continueHandler}
        handleCancel={this.handleCancel}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  swaps: getAllSwapsArray,
  requiresSigning: doesCurrentSwundleRequireSigning,
  readyToSign: isCurrentSwundleReadyToSign,
  readyToSend: isCurrentSwundleReadyToSend,
  isOpen: ({ orderModal: { show } }) => show
})

const mapDispatchToProps = {
  resetSwaps,
  toggle: toggleOrderModal,
  signSwapTxs,
  sendSwapTxs,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwapSubmitModal)
