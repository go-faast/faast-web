import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import { getAllAssets, getCurrentPortfolio, getAllSwapsArray } from 'Selectors'
import { sendSwapDeposits } from 'Actions/portfolio'
import { resetSwaps } from 'Actions/swap'

import SignTxModalView from './view'

class SignTxModal extends Component {
  constructor (props) {
    super(props)
    const { view, wallet } = props
    const { isBlockstack, type, nestedWallets } = wallet
    this.state = {
      view: view || (isBlockstack ? 'blockstack' : (type === 'MultiWallet' && nestedWallets.length > 0 ? nestedWallets[0].type : type)),
      isSigning: false
    }
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleCloseModal (signed = false) {
    const { toggleModal, resetSwaps } = this.props
    closeTrezorWindow()
    this.setState({ isSigning: false })
    toggleModal()
    if (!signed) {
      resetSwaps()
    }
  }

  _handleSubmit (values, dispatch) {
    if (this.state.view === 'EthereumWalletKeystore' && !values.password) {
      return toastr.error('Enter your wallet password to sign the transactions')
    }
    this.setState({ isSigning: true })

    const { swaps } = this.props
    return dispatch(sendSwapDeposits(swaps, { password: values.password }))
      .then(() => {
        if (!this.props.showModal) throw new Error('modal closed')
        this._handleCloseModal(true)
        dispatch(push('/balances'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        this._handleCloseModal()
      })
  }

  render () {
    const { swaps } = this.props
    const readyToSign = () => {
      const hasError = swaps.some((swap) => swap.errors && swap.errors.length)
      const statusDetails = swaps.map(({ status: { details } }) => details)
      return !hasError && statusDetails.every(s => s === 'waiting for transaction to be signed')
    }
    const readyToSignResult = readyToSign()
    return (
      <SignTxModalView
        showModal={this.props.showModal}
        view={this.state.view}
        signTxProps={{
          readyToSign: readyToSignResult,
          onSubmit: this._handleSubmit,
          handleCancel: this._handleCloseModal,
          isSigning: this.state.isSigning,
          swapList: swaps,
          type: this.state.view
        }}
        orderStatusProps={{
          swapList: swaps,
          handleClose: this._handleCloseModal
        }}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  assets: getAllAssets,
  swaps: getAllSwapsArray,
  wallet: getCurrentPortfolio,
})

const mapDispatchToProps = {
  resetSwaps,
}

export default connect(mapStateToProps, mapDispatchToProps)(SignTxModal)
