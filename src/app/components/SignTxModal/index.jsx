import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus, estimateReceiveAmount } from 'Utilities/swap'

import { getAllAssets, getCurrentPortfolio, getAllSwapsArray } from 'Selectors'
import { sendSwapDeposits } from 'Actions/portfolio'
import { resetSwaps } from 'Actions/swap'

import Units from 'Components/Units'

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

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState({ isSigning: false })
    this.props.resetSwaps()
    this.props.toggleModal()
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
        this._handleCloseModal()
        dispatch(push('/balances'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        this._handleCloseModal()
      })
  }

  render () {
    const { swaps, assets } = this.props
    const readyToSign = () => {
      const hasError = swaps.some((swap) => swap.errors && swap.errors.length)
      const statuses = swaps.map(getSwapStatus).map(({ details }) => details)
      return !hasError && statuses.every(s => s === 'waiting for transaction to be signed')
    }
    const getStatus = (swap) => {
      const { status, details } = getSwapStatus(swap)
      if (status === 'error') {
        return {
          cl: 'failed',
          text: 'failed',
          details: details
        }
      }
      if (status === 'working') {
        return {
          cl: 'in-progress',
          text: 'in progress',
          details: details
        }
      }
      return {
        cl: 'done',
        text: 'done'
      }
    }
    const getError = (swap) => {
      const { errors } = swap
      if (errors && Array.isArray(errors) && errors.length) {
        const eKeys = errors.map(e => Object.keys(e)[0])
        if (eKeys.includes('swapMarketInfo')) {
          const error = Object.values(errors.find(e => Object.keys(e)[0] === 'swapMarketInfo'))[0]
          if (error.message && error.message.startsWith('minimum')) return error.message
          if (error.message && error.message.startsWith('maximum')) return error.message
        }
        if (eKeys.includes('swapMarketInfo') || eKeys.includes('swapPostExchange')) {
          return 'swap unavailable at this time'
        }
        // if (eKeys.includes('swapEstimateTxFee')) {
        //   return 'web3 communication error'
        // }
        if (eKeys.includes('swapSufficientDeposit')) {
          return 'estimated amount to receive is below 0'
        }
        if (eKeys.includes('swapSufficientFees')) {
          return 'insufficient balance for txn fee'
        }
        return 'unknown error'
      }
    }
    const displayFee = (feeAmount, feeSymbol) => {
      if (feeAmount === null) {
        return (<span><i>TBD</i> {feeSymbol}</span>)
      }
      return (<Units value={feeAmount} symbol={feeSymbol}/>)
    }

    const swapList = swaps.map((swap) => {
      const { sendSymbol, receiveSymbol, tx } = swap
      const sendAsset = assets[sendSymbol]
      const receiveAsset = assets[receiveSymbol]
      return {
        ...swap,
        sendAsset,
        receiveAsset,
        receiveUnits: estimateReceiveAmount(swap, receiveAsset),
        status: getStatus(swap),
        error: getError(swap),
        displayTxFee: !tx ? null : displayFee(tx.feeAmount, tx.feeAsset),
        displayFee: displayFee(swap.fee, receiveSymbol),
      }
    })
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
          swapList: swapList,
          type: this.state.view
        }}
        orderStatusProps={{
          swapList: swapList,
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
