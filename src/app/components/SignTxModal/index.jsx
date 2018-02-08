import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import SignTxModalView from './view'
import { closeTrezorWindow } from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { getSwapStatus, estimateReceiveAmount } from 'Utilities/swap'
import { sendSwapDeposits } from 'Actions/portfolio'
import { getAllAssets, getCurrentPortfolio } from 'Selectors'

class SignTxModal extends Component {
  constructor (props) {
    super(props)
    const { view, wallet } = props
    const { isBlockstack, type, nestedWallets } = wallet
    this.state = {
      view: view || (isBlockstack ? 'blockstack' : (type === 'MultiWallet' ? nestedWallets[0].type : type)),
      isSigning: false
    }
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  _handleCloseModal () {
    closeTrezorWindow()
    this.setState({ isSigning: false })
    this.props.toggleModal()
  }

  _handleSubmit (values, dispatch) {
    if (this.state.view === 'EthereumWalletKeystore' && !values.password) {
      return toastr.error('Enter your wallet password to sign the transactions')
    }
    this.setState({ isSigning: true })

    const { swap, mock: { mocking: isMocking } } = this.props
    return dispatch(sendSwapDeposits(swap, { password: values.password }, isMocking))
      .then(() => {
        if (!this.props.showModal) throw new Error('modal closed')
        this.setState({ isSigning: false })
        dispatch(push('/balances'))
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        this._handleCloseModal()
      })
  }

  render () {
    const readyToSign = () => {
      const hasError = this.props.swap.some((a) => {
        return a.list.some((b) => b.errors && b.errors.length)
      })
      const statuses = this.props.swap.reduce((a, b) => {
        return a.concat(b.list.map(getSwapStatus).map(c => c.details))
      }, [])
      console.log('hasError', hasError)
      console.log('statuses', statuses)
      return !hasError && statuses.every(s => s === 'waiting for transaction to be signed')
    }
    const estimateTxFee = ({ tx }) => {
      if (tx) {
        if (typeof tx.feeAmount === 'number') {
          return tx.feeAmount
        }
        return `TBD ${tx.feeAsset}`
      }
      return 'TBD'
    }
    const getStatus = (a) => {
      const status = getSwapStatus(a)
      if (status.status === 'error') {
        return {
          cl: 'failed',
          text: 'failed',
          details: status.details
        }
      }
      if (status.status === 'working') {
        return {
          cl: 'in-progress',
          text: 'in progress',
          details: status.details
        }
      }
      return {
        cl: 'done',
        text: 'done'
      }
    }
    const getError = (a) => {
      if (a.errors && Array.isArray(a.errors) && a.errors.length) {
        const eKeys = a.errors.map(e => Object.keys(e)[0])
        if (eKeys.includes('swapMarketInfo')) {
          const error = Object.values(a.errors.find(e => Object.keys(e)[0] === 'swapMarketInfo'))[0]
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
    const assets = this.props.assets
    const swapList = this.props.swap.reduce((allSwaps, sending) => 
      allSwaps.concat(sending.list.map((receiving) => {
        const { symbol: fromSymbol } = sending
        const { symbol: toSymbol } = receiving
        const fromAsset = assets[fromSymbol]
        const toAsset = assets[toSymbol]
        console.log('sending', sending)
        console.log('receiving', receiving)
        return {
          from: fromAsset,
          to: toAsset,
          pair: `${fromSymbol}_${toSymbol}`,
          swap: receiving,
          txFee: estimateTxFee(receiving),
          receiveAmount: estimateReceiveAmount(receiving, toAsset),
          status: getStatus(receiving),
          error: getError(receiving)
        }
      })),
    [])
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

const mapStateToProps = (state) => ({
  assets: getAllAssets(state),
  swap: state.swap,
  wallet: getCurrentPortfolio(state),
  mock: state.mock
})

export default connect(mapStateToProps)(SignTxModal)
