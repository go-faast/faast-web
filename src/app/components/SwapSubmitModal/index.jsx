import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import { getAllSwapsArray, isCurrentSwundleReadyToSign } from 'Selectors'
import { signSwapTxs, sendSwapTxs } from 'Actions/swap'
import { resetSwaps } from 'Actions/swap'
import { toggleOrderModal } from 'Actions/redux'

import SwapSubmitModalView from './view'

class SwapSubmitModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      startedSigning: false
    }
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSignTxs = this.handleSignTxs.bind(this)
    this.handleSendTxs = this.handleSendTxs.bind(this)
  }

  handleCancel () {
    const { toggle, resetSwaps } = this.props
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
    const { swaps } = this.props
    const { startedSigning } = this.state
    const disableStartSigning = swaps.some((swap) => swap.status.detailsCode !== 'unsigned')
    const disableStartSending = swaps.some((swap) => swap.status.detailsCode !== 'signed')
    const continueDisabled = startedSigning ? disableStartSending : disableStartSigning
    const continueHandler = startedSigning ? this.handleSendTxs : this.handleSignTxs
    const continueText = startedSigning ? 'Submit all' : 'Begin signing'
    return (
      <SwapSubmitModalView
        continueDisabled={continueDisabled}
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
  readyToSign: isCurrentSwundleReadyToSign,
  isOpen: ({ orderModal: { show } }) => show,
})

const mapDispatchToProps = {
  resetSwaps,
  toggle: toggleOrderModal,
  signSwapTxs,
  sendSwapTxs,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwapSubmitModal)
