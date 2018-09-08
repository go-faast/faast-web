import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import {
  getCurrentSwundle, 
  isCurrentSwundleReadyToSign, isCurrentSwundleReadyToSend,
  isCurrentSwundleSigning, isCurrentSwundleSending,
  doesCurrentSwundleRequireSigning,
} from 'Selectors'
import { signSwundle, sendSwundle, removeSwundle } from 'Actions/swundle'
import { toggleOrderModal } from 'Actions/orderModal'

import SwapSubmitModalView from './view'

class SwapSubmitModal extends Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSignTxs = this.handleSignTxs.bind(this)
    this.handleSendTxs = this.handleSendTxs.bind(this)
  }

  handleCancel () {
    const { swundle, toggle, removeSwundle } = this.props
    closeTrezorWindow()
    toggle()
    removeSwundle(swundle)
  }

  handleSignTxs () {
    const { swundle, signSwundle } = this.props
    signSwundle(swundle)
      .then(() => closeTrezorWindow())
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        closeTrezorWindow()
      })
  }

  handleSendTxs () {
    const { swundle, sendSwundle, toggle, routerPush } = this.props
    sendSwundle(swundle)
      .then((updatedSwundle) => {
        if (updatedSwundle.swaps.every((swap) => swap.tx.sent)) {
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
    const {
      swundle, requiresSigning, readyToSign, readyToSend, startedSigning, startedSending
    } = this.props
    if (!swundle) {
      return null
    }

    let errorMessage = swundle.error
    const currentSwap = swundle.swaps.find(({ txSigning, txSending, sendWallet }) =>
      txSigning || (txSending && sendWallet && !sendWallet.isSignTxSupported))
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
        errorMessage={errorMessage}
        currentSwap={currentSwap}
        {...this.props}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  swundle: getCurrentSwundle,
  requiresSigning: doesCurrentSwundleRequireSigning,
  readyToSign: isCurrentSwundleReadyToSign,
  readyToSend: isCurrentSwundleReadyToSend,
  startedSigning: isCurrentSwundleSigning,
  startedSending: isCurrentSwundleSending,
  isOpen: ({ orderModal: { show } }) => show
})

const mapDispatchToProps = {
  toggle: toggleOrderModal,
  removeSwundle,
  signSwundle,
  sendSwundle,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwapSubmitModal)
